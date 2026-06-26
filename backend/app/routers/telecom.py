"""
backend.app.routers.telecom (통신사 회선 조회 API)
================================================================================
lgu_target_test.telecom_test_lines에서 회선 그레인 데이터를 조회한다. 목록은
customer_id/customer_grade로 선택 필터링하고, 각 행에 today 기준 약정 D-day와
단말 사용 개월수를 서버에서 계산해 응답한다. line_id가 Adobe Target 식별자
(CustomerId/thirdPartyId) 키로 사용된다.

[Main Functions]
===========
- GET /api/telecom/lines: 회선 목록(선택 필터)
- GET /api/telecom/lines/{line_id}: 회선 단건

[Endpoints/Classes/Functions]
=======================
- list_telecom_lines
- get_telecom_line

[Dependencies]
=========
- fastapi, sqlalchemy
- app.telecom_db.get_telecom_db, select_telecom_lines, select_telecom_line, TelecomTestLine
- app.schemas.TelecomLineOut, TelecomLinesResponse
"""

from __future__ import annotations

import logging
from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.exc import DBAPIError, SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas import TelecomLineOut, TelecomLinesResponse
from app.telecom_db import (
    TelecomTestLine,
    get_telecom_db,
    select_telecom_line,
    select_telecom_lines,
)

logger = logging.getLogger(__name__)

router = APIRouter()


# 1. [파생] today 기준 약정 D-day(만료까지 남은 일수)·단말 사용 개월수를 계산한다.
def _derive(row: TelecomTestLine) -> tuple[Optional[int], Optional[int]]:
    today = date.today()
    d_day = (row.contract_end_date - today).days if row.contract_end_date else None
    age_months = None
    if row.device_purchase_date:
        p = row.device_purchase_date
        age_months = (today.year - p.year) * 12 + (today.month - p.month)
    return d_day, age_months


# 2. [직렬화] ORM 행 + 파생값을 TelecomLineOut으로 변환한다.
def _to_out(row: TelecomTestLine) -> TelecomLineOut:
    d_day, age_months = _derive(row)
    out = TelecomLineOut.model_validate(row)
    out.contract_d_day = d_day
    out.device_age_months = age_months
    return out


# 3. [목록] customer_id/customer_grade 선택 필터 후 line_id 오름차순 반환.
@router.get("/telecom/lines", response_model=TelecomLinesResponse)
async def list_telecom_lines(
    customer_id: Optional[str] = Query(None),
    customer_grade: Optional[str] = Query(None),
    session: AsyncSession = Depends(get_telecom_db),
) -> TelecomLinesResponse:
    try:
        stmt = select_telecom_lines()
        if customer_id:
            stmt = stmt.where(TelecomTestLine.customer_id == customer_id)
        if customer_grade:
            stmt = stmt.where(TelecomTestLine.customer_grade == customer_grade)
        rows = (await session.execute(stmt)).scalars().all()
        data = [_to_out(r) for r in rows]
        return TelecomLinesResponse(data=data, total_count=len(data))
    except (DBAPIError, SQLAlchemyError, OSError) as exc:
        logger.exception("list_telecom_lines DB error: %s", exc)
        raise HTTPException(status_code=503, detail="database_unavailable") from exc


# 4. [단건] line_id로 회선 1건 조회(없으면 404).
@router.get("/telecom/lines/{line_id}", response_model=TelecomLineOut)
async def get_telecom_line(
    line_id: str,
    session: AsyncSession = Depends(get_telecom_db),
) -> TelecomLineOut:
    try:
        row = (await session.execute(select_telecom_line(line_id))).scalar_one_or_none()
    except (DBAPIError, SQLAlchemyError, OSError) as exc:
        logger.exception("get_telecom_line DB error line_id=%s: %s", line_id, exc)
        raise HTTPException(status_code=503, detail="database_unavailable") from exc
    if row is None:
        raise HTTPException(status_code=404, detail="line_not_found")
    return _to_out(row)
