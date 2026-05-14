"""
backend.app.routers.coupons (쿠폰 목록 API)
================================================================================
test_coupons_data에서 표시 컬럼(created·recipient·캠페인·워크플로)을 조회하며, created 구간 필터·recipient_id당 최신 1행·page(OFFSET)·cursor(keyset)·CSV(페이지/전체)를 제공한다.

[Main Functions]
===========
- GET /api/coupons: page 또는 cursor 기반 목록 조회(필터 구간 내)
- GET /api/coupons/csv: scope=page(현재 구간) 또는 scope=all(필터 전체) CSV

[Endpoints/Classes/Functions]
=======================
- list_coupons
- download_coupons_csv

[Dependencies]
=========
- fastapi, sqlalchemy
- app.database.get_db, select_coupon_rows, TestCouponsData, coupon_visible_created_filter, coupon_list_from_dedup
- app.schemas.CouponRowOut, CouponsListResponse, PaginationOut
"""

from __future__ import annotations

import asyncio
import csv
from datetime import datetime
import io
import logging
import math
import time
from typing import Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
from sqlalchemy import and_, distinct, func, or_, select
from sqlalchemy.exc import DBAPIError, SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import (
    TestCouponsData,
    coupon_list_from_dedup,
    coupon_visible_created_filter,
    get_db,
    select_coupon_rows,
)
from app.schemas import CouponRowOut, CouponsListResponse, PaginationOut

logger = logging.getLogger(__name__)

router = APIRouter()

# 필터 적용 행 수 TTL 캐시(초)
_FILTERED_COUNT_LOCK = asyncio.Lock()
_FILTERED_COUNT_VALUE: Optional[int] = None
_FILTERED_COUNT_EXPIRES_MONO: float = 0.0
_FILTERED_COUNT_TTL_SEC = 600.0


# 1. [베이스] 수신자당 1행 집합을 created DESC, id DESC로 정렬한 Select
def _coupon_rows_filtered():
    return select_coupon_rows()


# 2. [통계] 필터 구간의 DISTINCT recipient_id 수를 TTL 캐시한다.
async def _filtered_row_count_cached(session: AsyncSession) -> int:
    global _FILTERED_COUNT_VALUE, _FILTERED_COUNT_EXPIRES_MONO
    now = time.monotonic()
    if _FILTERED_COUNT_VALUE is not None and now < _FILTERED_COUNT_EXPIRES_MONO:
        return _FILTERED_COUNT_VALUE
    async with _FILTERED_COUNT_LOCK:
        now = time.monotonic()
        if _FILTERED_COUNT_VALUE is not None and now < _FILTERED_COUNT_EXPIRES_MONO:
            return _FILTERED_COUNT_VALUE
        try:
            stmt = select(func.count(distinct(TestCouponsData.recipient_id))).where(
                coupon_visible_created_filter()
            )
            cnt = int((await session.execute(stmt)).scalar_one())
        except (DBAPIError, SQLAlchemyError) as exc:
            logger.error("_filtered_row_count_cached failed: %s", exc)
            raise
        _FILTERED_COUNT_VALUE = cnt
        _FILTERED_COUNT_EXPIRES_MONO = time.monotonic() + _FILTERED_COUNT_TTL_SEC
        return cnt


# 3. [커서] dedup 결과 집합의 created·id로 next/prev keyset 필터를 생성한다.
def _cursor_filter(
    ranked,
    cursor_created: datetime,
    cursor_id: int,
    direction: Literal["next", "prev"],
):
    c = ranked.c
    if direction == "prev":
        return or_(
            c.created > cursor_created,
            and_(c.created == cursor_created, c.id > cursor_id),
        )
    return or_(
        c.created < cursor_created,
        and_(c.created == cursor_created, c.id < cursor_id),
    )


# 4. [조회] page 호환(OFFSET) + keyset(next/prev) + last(ASC 시작점)를 하나로 조합한다.
def _build_stmt(
    page: int,
    page_size: int,
    cursor_created: Optional[datetime],
    cursor_id: Optional[int],
    direction: Literal["next", "prev", "last"],
):
    ranked, outer = coupon_list_from_dedup()
    base_desc = outer.order_by(ranked.c.created.desc(), ranked.c.id.desc())
    if direction == "last":
        return (
            outer.order_by(None)
            .order_by(ranked.c.created.asc(), ranked.c.id.asc())
            .limit(page_size)
        )
    if cursor_created is not None and cursor_id is not None:
        if direction == "prev":
            return (
                base_desc.where(_cursor_filter(ranked, cursor_created, cursor_id, "prev"))
                .order_by(None)
                .order_by(ranked.c.created.asc(), ranked.c.id.asc())
                .limit(page_size)
            )
        return (
            base_desc.where(_cursor_filter(ranked, cursor_created, cursor_id, "next")).limit(
                page_size
            )
        )
    offset = (page - 1) * page_size
    return base_desc.offset(offset).limit(page_size)


def _serialize_cursor(created: datetime, row_id: int) -> dict[str, object]:
    return {"created": created.isoformat(), "id": row_id}


def _build_cursors(rows) -> tuple[Optional[dict[str, object]], Optional[dict[str, object]]]:
    if not rows:
        return None, None
    first = rows[0]._mapping
    last = rows[-1]._mapping
    prev_cursor = _serialize_cursor(first["created"], int(first["id"]))
    next_cursor = _serialize_cursor(last["created"], int(last["id"]))
    return next_cursor, prev_cursor


def _rows_to_response_data(rows) -> list[CouponRowOut]:
    data: list[CouponRowOut] = []
    for r in rows:
        m = r._mapping
        data.append(
            CouponRowOut(
                created=m["created"],
                recipient_id=m["recipient_id"],
                campaign_label=m["campaign_label"],
                workflow_label=m["workflow_label"],
            )
        )
    return data


# 5. [목록] OFFSET(page)·KEYSET(cursor)·LAST(direction=last)를 지원한다.
@router.get("/coupons", response_model=CouponsListResponse)
async def list_coupons(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    cursor_created: Optional[datetime] = Query(None),
    cursor_id: Optional[int] = Query(None),
    direction: Literal["next", "prev", "last"] = Query("next"),
    session: AsyncSession = Depends(get_db),
) -> CouponsListResponse:
    if (cursor_created is None) ^ (cursor_id is None):
        raise HTTPException(status_code=400, detail="cursor_created_and_cursor_id_required")
    try:
        total_count = await _filtered_row_count_cached(session)
        total_pages = (
            math.ceil(total_count / page_size) if total_count > 0 and page_size else 0
        )
        stmt = _build_stmt(page, page_size, cursor_created, cursor_id, direction)
        result = await session.execute(stmt)
        rows = result.all()
        rows_for_response = rows
        if direction in ("prev", "last"):
            rows_for_response = list(reversed(rows))
        next_cursor, prev_cursor = _build_cursors(rows_for_response)
        data = _rows_to_response_data(rows_for_response)
        resolved_page = page
        if direction == "last" and total_pages > 0:
            resolved_page = total_pages
        if resolved_page <= 1:
            prev_cursor = None
        if total_pages > 0 and resolved_page >= total_pages:
            next_cursor = None
        if len(rows_for_response) < page_size:
            if direction == "next":
                next_cursor = None
            if direction == "prev":
                prev_cursor = None
        return CouponsListResponse(
            data=data,
            pagination=PaginationOut(
                page=resolved_page,
                page_size=page_size,
                total_count=total_count,
                total_pages=total_pages,
                next_cursor=next_cursor,
                prev_cursor=prev_cursor,
            ),
        )
    except (DBAPIError, SQLAlchemyError, OSError) as exc:
        logger.exception("list_coupons DB error: %s", exc)
        raise HTTPException(status_code=503, detail="database_unavailable") from exc


# 6. [CSV] CSV 예약문자(쉼표, 따옴표, 줄바꿈)가 있는 값을 안전하게 직렬화한다.
def _to_csv_text(rows) -> str:
    buffer = io.StringIO()
    writer = csv.writer(buffer, lineterminator="\n", quoting=csv.QUOTE_MINIMAL)
    writer.writerow(
        [
            "created",
            "recipient_id",
            "campaign_label",
            "workflow_label",
        ]
    )
    for row in rows:
        m = row._mapping
        writer.writerow(
            [
                "" if m["created"] is None else str(m["created"]),
                "" if m["recipient_id"] is None else str(m["recipient_id"]),
                "" if m["campaign_label"] is None else str(m["campaign_label"]),
                "" if m["workflow_label"] is None else str(m["workflow_label"]),
            ]
        )
    return "\ufeff" + buffer.getvalue()


# 7. [다운로드] scope=page는 page·cursor·last와 동일, scope=all은 dedup·필터 적용 전체
@router.get("/coupons/csv")
async def download_coupons_csv(
    scope: Literal["page", "all"] = Query("page"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    cursor_created: Optional[datetime] = Query(None),
    cursor_id: Optional[int] = Query(None),
    direction: Literal["next", "prev", "last"] = Query("next"),
    session: AsyncSession = Depends(get_db),
) -> Response:
    if scope == "page":
        if (cursor_created is None) ^ (cursor_id is None):
            raise HTTPException(status_code=400, detail="cursor_created_and_cursor_id_required")
    try:
        if scope == "all":
            stmt = _coupon_rows_filtered()
            result = await session.execute(stmt)
            rows_for_csv = result.all()
            filename = "coupons_filtered_all.csv"
        else:
            stmt = _build_stmt(page, page_size, cursor_created, cursor_id, direction)
            result = await session.execute(stmt)
            rows = result.all()
            rows_for_csv = rows
            if direction in ("prev", "last"):
                rows_for_csv = list(reversed(rows))
            filename_page = page
            if direction == "last":
                total_count = await _filtered_row_count_cached(session)
                total_pages = math.ceil(total_count / page_size) if total_count > 0 else 1
                filename_page = max(total_pages, 1)
            filename = f"coupons_page_{filename_page}.csv"
        csv_text = _to_csv_text(rows_for_csv)
        return Response(
            content=csv_text,
            media_type="text/csv; charset=utf-8",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"'
            },
        )
    except (DBAPIError, SQLAlchemyError, OSError) as exc:
        logger.exception("download_coupons_csv DB error: %s", exc)
        raise HTTPException(status_code=503, detail="database_unavailable") from exc
