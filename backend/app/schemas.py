"""
backend.app.schemas (Pydantic 응답 모델)
================================================================================
쿠폰 목록 API와 통신사 회선 조회 API의 응답·페이지네이션 스키마를 정의한다.

[Main Functions]
===========
- 응답 직렬화 및 OpenAPI 문서화

[Endpoints/Classes/Functions]
=======================
- CouponRowOut, PaginationOut, CouponsListResponse
- TelecomLineOut, TelecomLinesResponse

[Dependencies]
=========
- pydantic v2
"""

from __future__ import annotations

from datetime import date, datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict, Field


# 1. [행] API 응답에 포함되는 4개 필드만 노출한다.
class CouponRowOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    created: Optional[datetime] = None
    recipient_id: str = ""
    campaign_label: str = ""
    workflow_label: str = ""


# 2. [페이지네이션] total_count는 통계 기반 추정치일 수 있고, next/prev 커서를 포함한다.
class PaginationOut(BaseModel):
    page: int = Field(ge=1)
    page_size: int = Field(ge=1)
    total_count: int = Field(ge=0)
    total_pages: int = Field(ge=0)
    next_cursor: Optional[Dict[str, Any]] = None
    prev_cursor: Optional[Dict[str, Any]] = None


class CouponsListResponse(BaseModel):
    data: List[CouponRowOut]
    pagination: PaginationOut


# 3. [회선] 통신사 회선 1행(고객 카드 표시 + Target 식별자 line_id) + 서버 파생값
class TelecomLineOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    line_id: str = ""
    customer_id: str = ""
    customer_name: str = ""
    customer_grade: str = ""
    bundle_yn: str = ""
    phone_no: str = ""
    plan_name: str = ""
    network_type: str = ""
    monthly_fee: int = 0
    contract_type: str = ""
    contract_end_date: Optional[date] = None
    device_model: str = ""
    device_purchase_date: Optional[date] = None
    data_usage_pct: int = 0
    age_group: str = ""
    join_date: Optional[date] = None
    churn_risk: str = ""
    marketing_consent_yn: str = ""
    # 서버에서 today 기준으로 계산하는 파생값(저장 안 함)
    contract_d_day: Optional[int] = None
    device_age_months: Optional[int] = None


class TelecomLinesResponse(BaseModel):
    data: List[TelecomLineOut]
    total_count: int = Field(ge=0)
