"""Adobe Target offers 프록시. POST /api/target/offers → get_offers·오퍼 파싱. DeliveryRequest.id 타입은 SDK VisitorId(OpenAPI 생성명)."""

from __future__ import annotations

import asyncio
import logging
from typing import Any, Dict, Optional

from fastapi import APIRouter, HTTPException
from pydantic import AliasChoices, BaseModel, ConfigDict, Field
from urllib3.exceptions import LocationParseError

from delivery_api_client import (
    Address,
    ChannelType,
    Context,
    DeliveryRequest,
    ExecuteRequest,
    MboxRequest,
    ModelProperty,
    RequestDetails,
)
from delivery_api_client.exceptions import ApiException

from adobe_backend.target_backend.target_client import get_property_token, get_target_client
from adobe_backend.target_backend.target_config import AdobeTargetConfigError, get_adobe_target_settings
from adobe_backend.target_backend.target_debug_utils import at_debug_log_request, at_debug_log_response
from adobe_backend.target_backend.target_delivery_utils import (
    DEFAULT_TARGET_PAGE_LOAD_URL,
    TARGET_GLOBAL_MBOX,
    api_exception_body_text,
    build_delivery_id,
    clear_settings_and_target_client_caches,
    extract_id_field,
    offers_from_execute_response,
)

# CAUTION: ApiClient()/Configuration()을 인자 없이 직접 생성하면 TypeWithDefault 메타클래스가
# 빈 host를 잠궈 LocationParseError 발생. 직렬화 확인은 delivery_request.to_dict()만 사용.

logger = logging.getLogger(__name__)
router = APIRouter()


class OffersRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    mbox_name: str = Field(default_factory=lambda: get_adobe_target_settings().offer_mbox_name)
    page_url: Optional[str] = None
    tnt_id: Optional[str] = Field(
        default=None,
        validation_alias=AliasChoices("tntId", "tnt_id"),
    )
    third_party_id: Optional[str] = Field(
        default=None,
        validation_alias=AliasChoices("thirdPartyId", "third_party_id"),
    )
    # SDK get_offers 옵션: 이전 응답 쿠키·힌트·sessionId (문서: 동일 tnt/thirdParty에 30분 내 sessionId 일관)
    target_cookie: Optional[str] = None
    target_location_hint: Optional[str] = None
    session_id: Optional[str] = None
    params: Optional[Dict[str, str]] = None


def _get_offers_sync(body: OffersRequest) -> Dict[str, Any]:
    client = get_target_client()
    property_token = get_property_token()
    delivery_id, tnt_sent = build_delivery_id(body.tnt_id, body.third_party_id)
    mbox_params: Dict[str, str] = dict(body.params or {})
    mbox_kw: Dict[str, Any] = {"parameters": mbox_params or None}

    # 글로벌 mbox는 execute.mboxes에 넣으면 400이므로 pageLoad로 보낸다
    if body.mbox_name.strip().lower() == TARGET_GLOBAL_MBOX:
        page_url = (body.page_url or "").strip() or DEFAULT_TARGET_PAGE_LOAD_URL
        page_load = RequestDetails(address=Address(url=page_url), **mbox_kw)
        execute = ExecuteRequest(page_load=page_load)
    else:
        mbox = MboxRequest(name=body.mbox_name, index=0, **mbox_kw)
        execute = ExecuteRequest(mboxes=[mbox])

    delivery_request = DeliveryRequest(
        id=delivery_id,
        context=Context(channel=ChannelType.WEB),
        execute=execute,
        _property=ModelProperty(token=property_token),  # OpenAPI 키 property → 생성기가 ModelProperty, 예약 피해 _property
    )

    at_debug_log_request(logger, "get_offers", delivery_request)

    target_opts: Dict[str, Any] = {"request": delivery_request}
    if (body.target_cookie or "").strip():
        target_opts["target_cookie"] = body.target_cookie.strip()
    if (body.target_location_hint or "").strip():
        target_opts["target_location_hint"] = body.target_location_hint.strip()
    if (body.session_id or "").strip():
        target_opts["session_id"] = body.session_id.strip()

    response = client.get_offers(target_opts)

    at_debug_log_response(logger, "get_offers", response)

    offers: list[dict[str, Any]] = []
    response_tnt: Optional[str] = None
    response_third: Optional[str] = None
    if response and response.get("response"):
        resp = response["response"]
        response_tnt = extract_id_field(resp, "tnt_id")
        response_third = extract_id_field(resp, "third_party_id")
        offers = offers_from_execute_response(resp)

    tnt_for_client = response_tnt or tnt_sent
    third_for_client = response_third or ((body.third_party_id or "").strip() or None)
    out: Dict[str, Any] = {"offers": offers, "mbox": body.mbox_name}
    if tnt_for_client:
        out["tntId"] = tnt_for_client
    if third_for_client:
        out["thirdPartyId"] = third_for_client
    if response:
        tc = response.get("target_cookie")
        if isinstance(tc, dict) and tc:
            out["target_cookie"] = tc
        lhc = response.get("target_location_hint_cookie")
        if isinstance(lhc, dict) and lhc:
            out["target_location_hint_cookie"] = lhc
    return out


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
