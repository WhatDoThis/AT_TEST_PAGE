"""
backend.app.schemas (Pydantic 응답 모델)
================================================================================
쿠폰 목록 API의 행·페이지네이션·최상위 응답 스키마를 정의한다.

[Main Functions]
===========
- 응답 직렬화 및 OpenAPI 문서화

[Endpoints/Classes/Functions]
=======================
- CouponRowOut, PaginationOut, CouponsListResponse

[Dependencies]
=========
- pydantic v2
"""

from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


# 1. [행] API 응답에 포함되는 4개 필드만 노출한다.
class CouponRowOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    created: Optional[datetime] = None
    campaign_label: str = ""
    workflow_label: str = ""
    coupon_id: str = ""


# 2. [페이지네이션] total_count는 통계 기반 추정치일 수 있다.
class PaginationOut(BaseModel):
    page: int = Field(ge=1)
    page_size: int = Field(ge=1)
    total_count: int = Field(ge=0)
    total_pages: int = Field(ge=0)


class CouponsListResponse(BaseModel):
    data: List[CouponRowOut]
    pagination: PaginationOut
