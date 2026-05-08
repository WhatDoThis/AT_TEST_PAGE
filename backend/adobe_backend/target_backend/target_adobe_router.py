"""
adobe_backend.target_backend.target_adobe_router (Adobe Target API 라우터)
================================================================================
프론트엔드에서 호출하는 Adobe Target offers 프록시 엔드포인트를 제공한다.
- POST /api/target/offers: 오퍼 조회 (페이지 로드/클릭 후 재조회)

[Main Functions]
===========
- get_offers_endpoint: Adobe Target get_offers 호출 및 오퍼 파싱(asyncio.to_thread로 동기 SDK 비블로킹)
- _get_offers_sync: 스레드에서 실행되는 동기 Target 호출 본문
- at_debug_log_request / at_debug_log_response: Delivery 진단 로그 유틸(별도 파일)
- build_delivery_visitor_id / offers_from_execute_response: Delivery 공통 유틸(별도 파일)
- DeliveryRequest.id(VisitorId): tntId·thirdPartyId·marketingCloudVisitorId 중 하나 필수 — `tnt_id` 미전달 시 `{uuid.hex}.28_0` 클라이언트 tntId 생성(응답 id.tntId 우선 반환)
- `OffersRequest` 의 `mbox_name` 기본값은 `get_adobe_target_settings().offer_mbox_name`(JSON 생략 시 글로벌 mbox 폴백)
- AdobeTargetConfigError → HTTP 400(설정 비ASCII·빈 값)
- urllib3 LocationParseError → HTTP 400(delivery URL 파싱 실패 시 캐시 무효화 후 재시도 가능)
- delivery ApiException(400) → HTTP 400(Adobe 본문 전달)
- 기타 예외 → HTTP 502(detail에 reason·message 포함)

[Endpoints/Classes/Functions]
=======================
- POST /target/offers

[Dependencies]
=========
- fastapi
- pydantic
- urllib3.exceptions.LocationParseError
- adobe_backend.target_backend.target_client
- adobe_backend.target_backend.target_debug_utils
- adobe_backend.target_backend.target_delivery_utils
- adobe_backend.target_backend.target_config
- delivery_api_client (DeliveryRequest·ExecuteRequest·RequestDetails·Address·ModelProperty·ApiException 등)
- asyncio (동기 SDK를 to_thread로 오프로딩)
"""

# ════════════════════════════════════════════════════════════════════════════════
# ████████  ADOBE TARGET 전용 파일 — 전체 코드가 Adobe Target 연동용  ████████
# ════════════════════════════════════════════════════════════════════════════════

from __future__ import annotations

import asyncio
import logging
from typing import Any, Dict, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from urllib3.exceptions import LocationParseError

from delivery_api_client import (
    Address,
    ChannelType,
    Context,
    DeliveryRequest,
    ExecuteRequest,
    MboxRequest,
    ModelProperty,  # ── Adobe Target ── OpenAPI `property` 스키마 → 생성기가 ModelProperty로 명명
    RequestDetails,
)
from delivery_api_client.exceptions import ApiException

from adobe_backend.target_backend.target_client import (
    AdobeTargetConfigError,
    get_property_token,
    get_target_client,
)
from adobe_backend.target_backend.target_config import get_adobe_target_settings
from adobe_backend.target_backend.target_debug_utils import (
    at_debug_log_request,
    at_debug_log_response,
)
from adobe_backend.target_backend.target_delivery_utils import (
    DEFAULT_TARGET_PAGE_LOAD_URL,
    api_exception_body_text,
    build_delivery_visitor_id,
    clear_settings_and_target_client_caches,
    is_target_global_mbox,
    offers_from_execute_response,
    tnt_id_from_delivery_response,
)

# ── Adobe Target ──
# CAUTION: `delivery_api_client.api_client.ApiClient()` 또는 `Configuration()`을
# **인자 없이** 직접 인스턴스화하지 말 것.
# OpenAPI 제너레이터의 `TypeWithDefault` 메타클래스 때문에 최초 호출이
# `cls._default`(host="https://.tt.omtrdc.net" — 빈 client)로 잠기고,
# 이후 SDK가 올바른 host로 `Configuration(host=...)`을 호출해도 kwargs가 무시되어
# urllib3에서 `LocationParseError: Failed to parse: '.tt.omtrdc.net'`이 발생한다.
# 직렬화 결과를 보고 싶으면 `delivery_request.to_dict()` / `to_str()` 인스턴스 메서드만 사용한다.

logger = logging.getLogger(__name__)
router = APIRouter()


# ── Adobe Target ── 요청 JSON 에서 mbox_name 생략 시 backend/env/config.adobe.json(로컬) 의 값과 프론트 키명을 맞춘다.
def _default_offer_mbox_name_from_settings() -> str:
    return get_adobe_target_settings().offer_mbox_name

# ── Adobe Target ── 오퍼 조회 요청 모델
class OffersRequest(BaseModel):
    mbox_name: str = Field(default_factory=_default_offer_mbox_name_from_settings)
    # ── Adobe Target ── `target-global-mbox`일 때 execute.pageLoad.address.url 로 쓰임(미입력 시 서버 폴백 URL).
    page_url: Optional[str] = None
    # ── Adobe Target ── 이전 응답의 `tnt_id` 재사용(우선). 없으면 백엔드가 `{uuid.hex}.28_0` 형 클라이언트 tntId를 만든다(SDK 자동 생성 없음).
    tnt_id: Optional[str] = None
    # ── Adobe Target ── 클릭 쿠키 파라미터를 Delivery execute parameters로 전달한다.
    profile_params: Optional[Dict[str, str]] = None
    params: Optional[Dict[str, str]] = None

# 1. [동기·스레드] Adobe Target get_offers 본문 — async 엔드포인트에서는 to_thread로만 호출한다.
def _get_offers_sync(body: OffersRequest) -> Dict[str, Any]:
    client = get_target_client()
    property_token = get_property_token()
    # ── Adobe Target ── SDK는 visitorId를 자동 생성하지 않으므로 tntId를 명시한다.
    visitor_model, tnt_sent = build_delivery_visitor_id(body.tnt_id)
    request_params: Dict[str, str] = {
        **(body.params or {}),
        **(body.profile_params or {}),
    }

    # ── Adobe Target ── 글로벌 mbox는 execute.mboxes에 넣을 수 없어서 pageLoad로만 요청한다.
    if is_target_global_mbox(body.mbox_name):
        page_url = (body.page_url or "").strip() or DEFAULT_TARGET_PAGE_LOAD_URL
        page_load = RequestDetails(
            address=Address(url=page_url),
            parameters=request_params,
        )
        execute = ExecuteRequest(page_load=page_load)
    else:
        mbox = MboxRequest(
            name=body.mbox_name,
            index=0,
            parameters=request_params,
        )
        execute = ExecuteRequest(mboxes=[mbox])

    delivery_request = DeliveryRequest(
        id=visitor_model,
        context=Context(channel=ChannelType.WEB),
        execute=execute,
        _property=ModelProperty(token=property_token),  # ── Adobe Target ── DeliveryRequest 필드명은 _property
    )

    # ── Adobe Target ── 진단: AT_DEBUG_DELIVERY=1 일 때 요청 본문 분할 로깅
    at_debug_log_request(logger, "get_offers", delivery_request)

    target_opts: Dict[str, Any] = {"request": delivery_request}

    response = client.get_offers(target_opts)

    # ── Adobe Target ── 진단: 응답 execute 상세(offers 전용)
    at_debug_log_response(logger, "get_offers", response)

    offers: list[dict[str, Any]] = []
    response_tnt: Optional[str] = None
    if response and response.get("response"):
        resp = response["response"]
        response_tnt = tnt_id_from_delivery_response(resp)
        offers = offers_from_execute_response(resp)

    # ── Adobe Target ── 다음 호출에는 응답의 정식 tntId(있으면)를 재사용하는 것이 권장된다.
    tnt_for_client = response_tnt or tnt_sent
    out: Dict[str, Any] = {"offers": offers, "mbox": body.mbox_name}
    if tnt_for_client:
        out["tnt_id"] = tnt_for_client
    return out


# ── Adobe Target ── 오퍼 조회 엔드포인트
@router.post("/target/offers")
async def get_offers_endpoint(body: OffersRequest) -> Dict[str, Any]:
    try:
        return await asyncio.to_thread(_get_offers_sync, body)
    except AdobeTargetConfigError as exc:
        logger.warning("[AT] offers config invalid: %s", exc)
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except LocationParseError as exc:
        clear_settings_and_target_client_caches()
        logger.warning("[AT] offers URL parse fail: %s", exc)
        raise HTTPException(
            status_code=400,
            detail=(
                "Adobe Target delivery URL could not be parsed (invalid or non-ASCII client/organization in "
                f"config). urllib3: {exc}"
            ),
        ) from exc
    except ApiException as exc:
        body_text = api_exception_body_text(exc)[:4000]
        if exc.status == 400:
            logger.warning("[AT] offers API 400: %s", body_text[:800])
            raise HTTPException(status_code=400, detail=body_text) from exc
        logger.error("[AT] offers API error status=%s", exc.status)
        raise HTTPException(
            status_code=502,
            detail={
                "code": "adobe_target_unavailable",
                "reason": type(exc).__name__,
                "status": exc.status,
                "message": body_text[:800],
            },
        ) from exc
    except Exception as exc:
        logger.exception("[AT] offers unexpected error: %s", exc)
        raise HTTPException(
            status_code=502,
            detail={
                "code": "adobe_target_unavailable",
                "reason": type(exc).__name__,
                "message": str(exc)[:800],
            },
        ) from exc
