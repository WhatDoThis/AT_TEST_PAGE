"""
backend.app.routers.coupons (쿠폰 목록 API)
================================================================================
test_coupons_data에서 4컬럼을 조회하며 page(OFFSET)·cursor(keyset)·CSV 다운로드를 제공한다.

[Main Functions]
===========
- GET /api/coupons: page 또는 cursor 기반 목록 조회
- GET /api/coupons/csv: 현재 조회 범위를 CSV로 다운로드

[Endpoints/Classes/Functions]
=======================
- list_coupons
- download_coupons_csv

[Dependencies]
=========
- fastapi, sqlalchemy
- app.database.get_db, select_coupon_rows, TestCouponsData
- app.schemas.CouponsListResponse, CouponRowOut, PaginationOut
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
from sqlalchemy import and_, or_, text
from sqlalchemy.exc import DBAPIError, SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import TestCouponsData, get_db, select_coupon_rows
from app.schemas import CouponRowOut, CouponsListResponse, PaginationOut

logger = logging.getLogger(__name__)

router = APIRouter()

# pg_class 추정이 불가할 때만 사용하는 정확 COUNT 캐시 (TTL 초)
_EXACT_COUNT_LOCK = asyncio.Lock()
_EXACT_COUNT_VALUE: Optional[int] = None
_EXACT_COUNT_EXPIRES_MONO: float = 0.0
_EXACT_COUNT_TTL_SEC = 600.0

_ESTIMATE_SQL = text(
    """
    SELECT COALESCE(c.reltuples::bigint, 0) AS estimate
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'test_coupons_data' AND n.nspname = 'public'
    """
)

_EXACT_COUNT_SQL = text("SELECT COUNT(*) FROM test_coupons_data")


# 1. [통계] reltuples 추정이 양수일 때만 사용하고, 0 이하·미신뢰는 exact COUNT(TTL)로 폴백한다.
async def _approximate_total_count(session: AsyncSession) -> int:
    try:
        result = await session.execute(_ESTIMATE_SQL)
        row = result.one()
        raw_est = row[0]
        if raw_est is None:
            estimate = 0
        else:
            estimate = int(raw_est)
    except (DBAPIError, SQLAlchemyError) as exc:
        logger.error("approximate_total_count failed: %s", exc)
        raise
    if estimate > 0:
        return estimate
    return await _exact_total_count_cached(session)


# 2. [보조] reltuples가 0 이하·미신뢰일 때 TTL 캐시된 정확 COUNT로 폴백한다.
async def _exact_total_count_cached(session: AsyncSession) -> int:
    global _EXACT_COUNT_VALUE, _EXACT_COUNT_EXPIRES_MONO
    now = time.monotonic()
    if _EXACT_COUNT_VALUE is not None and now < _EXACT_COUNT_EXPIRES_MONO:
        return _EXACT_COUNT_VALUE
    async with _EXACT_COUNT_LOCK:
        now = time.monotonic()
        if _EXACT_COUNT_VALUE is not None and now < _EXACT_COUNT_EXPIRES_MONO:
            return _EXACT_COUNT_VALUE
        try:
            cnt = int((await session.execute(_EXACT_COUNT_SQL)).scalar_one())
        except (DBAPIError, SQLAlchemyError) as exc:
            logger.error("_exact_total_count_cached failed: %s", exc)
            raise
        _EXACT_COUNT_VALUE = cnt
        _EXACT_COUNT_EXPIRES_MONO = time.monotonic() + _EXACT_COUNT_TTL_SEC
        return cnt


# 3. [커서] created 동률을 id로 보조해 next/prev keyset 필터를 생성한다.
def _cursor_filter(
    cursor_created: datetime,
    cursor_id: int,
    direction: Literal["next", "prev"],
):
    if direction == "prev":
        return or_(
            TestCouponsData.created > cursor_created,
            and_(
                TestCouponsData.created == cursor_created,
                TestCouponsData.id > cursor_id,
            ),
        )
    return or_(
        TestCouponsData.created < cursor_created,
        and_(
            TestCouponsData.created == cursor_created,
            TestCouponsData.id < cursor_id,
        ),
    )


# 4. [조회] page 호환(OFFSET) + keyset(next/prev) + last(ASC 시작점)를 하나로 조합한다.
def _build_stmt(
    page: int,
    page_size: int,
    cursor_created: Optional[datetime],
    cursor_id: Optional[int],
    direction: Literal["next", "prev", "last"],
):
    if direction == "last":
        return (
            select_coupon_rows()
            .order_by(None)
            .order_by(TestCouponsData.created.asc(), TestCouponsData.id.asc())
            .limit(page_size)
        )
    if cursor_created is not None and cursor_id is not None:
        if direction == "prev":
            return (
                select_coupon_rows()
                .where(_cursor_filter(cursor_created, cursor_id, "prev"))
                .order_by(None)
                .order_by(TestCouponsData.created.asc(), TestCouponsData.id.asc())
                .limit(page_size)
            )
        return (
            select_coupon_rows()
            .where(_cursor_filter(cursor_created, cursor_id, "next"))
            .limit(page_size)
        )
    offset = (page - 1) * page_size
    return select_coupon_rows().offset(offset).limit(page_size)


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
                campaign_label=m["campaign_label"],
                workflow_label=m["workflow_label"],
                coupon_id=m["coupon_id"],
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
        total_count = await _approximate_total_count(session)
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
    writer.writerow(["created", "campaign_label", "workflow_label", "coupon_id"])
    for row in rows:
        m = row._mapping
        writer.writerow(
            [
                "" if m["created"] is None else str(m["created"]),
                "" if m["campaign_label"] is None else str(m["campaign_label"]),
                "" if m["workflow_label"] is None else str(m["workflow_label"]),
                "" if m["coupon_id"] is None else str(m["coupon_id"]),
            ]
        )
    return "\ufeff" + buffer.getvalue()


# 7. [다운로드] page·cursor·last 파라미터를 동일하게 받아 CSV로 내려준다.
@router.get("/coupons/csv")
async def download_coupons_csv(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    cursor_created: Optional[datetime] = Query(None),
    cursor_id: Optional[int] = Query(None),
    direction: Literal["next", "prev", "last"] = Query("next"),
    session: AsyncSession = Depends(get_db),
) -> Response:
    if (cursor_created is None) ^ (cursor_id is None):
        raise HTTPException(status_code=400, detail="cursor_created_and_cursor_id_required")
    try:
        stmt = _build_stmt(page, page_size, cursor_created, cursor_id, direction)
        result = await session.execute(stmt)
        rows = result.all()
        rows_for_csv = rows
        if direction in ("prev", "last"):
            rows_for_csv = list(reversed(rows))
        filename_page = page
        if direction == "last":
            total_count = await _approximate_total_count(session)
            total_pages = math.ceil(total_count / page_size) if total_count > 0 else 1
            filename_page = max(total_pages, 1)
        csv_text = _to_csv_text(rows_for_csv)
        return Response(
            content=csv_text,
            media_type="text/csv; charset=utf-8",
            headers={
                "Content-Disposition": f'attachment; filename="coupons_page_{filename_page}.csv"'
            },
        )
    except (DBAPIError, SQLAlchemyError, OSError) as exc:
        logger.exception("download_coupons_csv DB error: %s", exc)
        raise HTTPException(status_code=503, detail="database_unavailable") from exc
