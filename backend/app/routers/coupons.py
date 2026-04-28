"""
backend.app.routers.coupons (쿠폰 목록 API)
================================================================================
test_coupons_data에서 4컬럼만 조회하고 OFFSET/LIMIT 페이징·추정 total을 반환한다.

[Main Functions]
===========
- GET /api/coupons: created DESC 페이징 목록

[Endpoints/Classes/Functions]
=======================
- list_coupons

[Dependencies]
=========
- fastapi, sqlalchemy
- app.database.get_db, select_coupon_rows
- app.schemas.CouponsListResponse, CouponRowOut, PaginationOut
"""

from __future__ import annotations

import asyncio
import csv
import io
import logging
import math
import time
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
from sqlalchemy import text
from sqlalchemy.exc import DBAPIError, SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db, select_coupon_rows
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


# 3. [목록] OFFSET/LIMIT — 깊은 페이지는 인덱스 스캔 비용이 커질 수 있음(운영 가이드).
@router.get("/coupons", response_model=CouponsListResponse)
async def list_coupons(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    session: AsyncSession = Depends(get_db),
) -> CouponsListResponse:
    try:
        total_count = await _approximate_total_count(session)
        total_pages = (
            math.ceil(total_count / page_size) if total_count > 0 and page_size else 0
        )
        offset = (page - 1) * page_size
        stmt = select_coupon_rows().offset(offset).limit(page_size)
        result = await session.execute(stmt)
        rows = result.all()
        data = []
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
        return CouponsListResponse(
            data=data,
            pagination=PaginationOut(
                page=page,
                page_size=page_size,
                total_count=total_count,
                total_pages=total_pages,
            ),
        )
    except (DBAPIError, SQLAlchemyError, OSError) as exc:
        logger.exception("list_coupons DB error: %s", exc)
        raise HTTPException(status_code=503, detail="database_unavailable") from exc


# 4. [CSV] CSV 예약문자(쉼표, 따옴표, 줄바꿈)가 있는 값을 안전하게 직렬화한다.
def _to_csv_text(rows: list[dict[str, object]]) -> str:
    buffer = io.StringIO()
    writer = csv.writer(buffer, lineterminator="\n", quoting=csv.QUOTE_MINIMAL)
    writer.writerow(["created", "campaign_label", "workflow_label", "coupon_id"])
    for row in rows:
        writer.writerow(
            [
                "" if row["created"] is None else str(row["created"]),
                "" if row["campaign_label"] is None else str(row["campaign_label"]),
                "" if row["workflow_label"] is None else str(row["workflow_label"]),
                "" if row["coupon_id"] is None else str(row["coupon_id"]),
            ]
        )
    return "\ufeff" + buffer.getvalue()


# 5. [다운로드] 현재 페이지 범위만 서버에서 CSV로 내려준다.
@router.get("/coupons/csv")
async def download_coupons_csv(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    session: AsyncSession = Depends(get_db),
) -> Response:
    try:
        offset = (page - 1) * page_size
        stmt = select_coupon_rows().offset(offset).limit(page_size)
        result = await session.execute(stmt)
        rows = []
        for r in result.all():
            m = r._mapping
            rows.append(
                {
                    "created": m["created"],
                    "campaign_label": m["campaign_label"],
                    "workflow_label": m["workflow_label"],
                    "coupon_id": m["coupon_id"],
                }
            )
        csv_text = _to_csv_text(rows)
        return Response(
            content=csv_text,
            media_type="text/csv; charset=utf-8",
            headers={
                "Content-Disposition": f'attachment; filename="coupons_page_{page}.csv"'
            },
        )
    except (DBAPIError, SQLAlchemyError, OSError) as exc:
        logger.exception("download_coupons_csv DB error: %s", exc)
        raise HTTPException(status_code=503, detail="database_unavailable") from exc
