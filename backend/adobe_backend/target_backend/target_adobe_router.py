"""
adobe_backend.target_backend.target_adobe_router (Adobe Target Delivery 프록시)
================================================================================
FastAPI 라우터. offers·profile-test·recommendation-test 요청을 Python SDK 로 전달하고
응답(오퍼·쿠키·tntId 등)을 클라이언트에 반환한다.
recommendation-test 의 mbox 이름은 `config.adobe.json` 의 `mboxes.recs_mbox_name` 이다.
recommendation-test 는 thirdPartyId·선택 customerIds(recipient_id)·MboxRequest.product·order 를 전달한다.

[Main Functions]
===========
- _get_offers_sync / get_offers_endpoint
- _profile_test_sync / profile_test_endpoint
- _recommendation_test_sync / recommendation_test_endpoint (recommendations·recommendations_meta 파싱)
- _sdk_opts / _run_delivery(다중 mbox) / _id_and_cookies / _handle_error
- _resolve_offer_mbox_name / _resolve_offers_mbox_names(부트스트랩 시 배너 전용 mbox 동봉)

[Endpoints/Classes/Functions]
=======================
- POST /api/target/offers
- POST /api/target/profile-test
- POST /api/target/recommendation-test
- _TargetVisitorRequest(공통 베이스), OffersRequest, ProfileTestRequest, RecommendationTestRequest

[Dependencies]
=========
- delivery_api_client (DeliveryRequest, ExecuteRequest, MboxRequest, Order, Product, CustomerId, AuthenticatedState, …)
- target_client, target_config, target_debug_utils, target_delivery_utils
- fastapi, pydantic, urllib3
"""

from __future__ import annotations

import asyncio
import logging
import uuid
from typing import Any, Dict, NoReturn, Optional

from fastapi import APIRouter, HTTPException
from pydantic import AliasChoices, BaseModel, ConfigDict, Field
from urllib3.exceptions import LocationParseError

from delivery_api_client import (
    AuthenticatedState,
    ChannelType,
    Context,
    CustomerId,
    DeliveryRequest,
    ExecuteRequest,
    MboxRequest,
    ModelProperty,
    Order,
    Product,
)
from delivery_api_client.exceptions import ApiException

from adobe_backend.target_backend.target_client import get_property_token, get_target_client
from adobe_backend.target_backend.target_config import AdobeTargetConfigError, get_adobe_target_settings
from adobe_backend.target_backend.target_debug_utils import at_debug_log_request, at_debug_log_response
from adobe_backend.target_backend.target_delivery_utils import (
    api_exception_body,
    build_delivery_id,
    clear_caches,
    extract_id_field,
    offers_from_execute,
)

logger = logging.getLogger(__name__)
router = APIRouter()


# ── 공통 헬퍼 ──

def _sdk_opts(cookie: Optional[str], hint: Optional[str], session: Optional[str]) -> dict[str, str]:
    """target_cookie·location_hint·session_id 중 값이 있는 것만 dict 로."""
    opts: dict[str, str] = {}
    if (cookie or "").strip():
        opts["target_cookie"] = cookie.strip()
    if (hint or "").strip():
        opts["target_location_hint"] = hint.strip()
    if (session or "").strip():
        opts["session_id"] = session.strip()
    return opts


def _run_delivery(
    label: str,
    delivery_id: Any,
    mboxes: list[MboxRequest],
    *,
    cookie: Optional[str] = None,
    hint: Optional[str] = None,
    session: Optional[str] = None,
) -> Optional[dict]:
    """DeliveryRequest 조립 → 요청 로깅 → SDK get_offers → 응답 로깅. (offers·profile·recs 공통 경로)

    mboxes 는 1개 이상. 부트스트랩 offers 는 bootstrap_mbox + 배너 mbox 들을 한 요청에 함께 싣는다.
    """
    request = DeliveryRequest(
        id=delivery_id,
        context=Context(channel=ChannelType.WEB),
        execute=ExecuteRequest(mboxes=mboxes),
        _property=ModelProperty(token=get_property_token()),
    )
    at_debug_log_request(logger, label, request)
    opts: dict[str, Any] = {"request": request, **_sdk_opts(cookie, hint, session)}
    response = get_target_client().get_offers(opts)
    at_debug_log_response(logger, label, response)
    return response


def _id_and_cookies(
    response: Optional[dict],
    third_fallback: Optional[str] = None,
) -> dict[str, Any]:
    """SDK 응답에서 tntId(Adobe 생성)·thirdPartyId·쿠키를 추출해 클라이언트용 dict 로."""
    out: dict[str, Any] = {}
    resp = response.get("response") if response else None

    tnt = extract_id_field(resp, "tnt_id") if resp else None
    third = extract_id_field(resp, "third_party_id") if resp else None
    if tnt:
        out["tntId"] = tnt
    if third or third_fallback:
        out["thirdPartyId"] = third or third_fallback

    if response:
        for key in ("target_cookie", "target_location_hint_cookie"):
            val = response.get(key)
            if isinstance(val, dict) and val:
                out[key] = val
    return out


def _handle_error(exc: Exception, label: str) -> NoReturn:
    """엔드포인트 공통 예외 처리."""
    if isinstance(exc, AdobeTargetConfigError):
        logger.warning("[AT] %s config: %s", label, exc)
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    if isinstance(exc, LocationParseError):
        clear_caches()
        logger.warning("[AT] %s URL parse: %s", label, exc)
        raise HTTPException(status_code=400, detail=f"URL parse error: {exc}") from exc
    if isinstance(exc, ApiException):
        body = api_exception_body(exc)[:4000]
        status = 400 if exc.status == 400 else 502
        logger.log(
            logging.WARNING if status == 400 else logging.ERROR,
            "[AT] %s API %s: %s",
            label,
            exc.status,
            body[:800],
        )
        detail: Any = (
            body
            if status == 400
            else {
                "code": "adobe_target_unavailable",
                "reason": type(exc).__name__,
                "status": exc.status,
                "message": body[:800],
            }
        )
        raise HTTPException(status_code=status, detail=detail) from exc
    logger.exception("[AT] %s error: %s", label, exc)
    raise HTTPException(
        status_code=502,
        detail={
            "code": "adobe_target_unavailable",
            "reason": type(exc).__name__,
            "message": str(exc)[:800],
        },
    ) from exc


# ── 공통 요청 모델 ──

class _TargetVisitorRequest(BaseModel):
    """offers·profile-test 공통 필드: 방문자 식별자(tntId·thirdPartyId)·쿠키·세션·페이지 컨텍스트."""

    model_config = ConfigDict(populate_by_name=True)

    page_url: Optional[str] = None
    tnt_id: Optional[str] = Field(None, validation_alias=AliasChoices("tntId", "tnt_id"))
    third_party_id: Optional[str] = Field(None, validation_alias=AliasChoices("thirdPartyId", "third_party_id"))
    target_cookie: Optional[str] = None
    target_location_hint: Optional[str] = None
    session_id: Optional[str] = None


# ── offers 엔드포인트 ──

class OffersRequest(_TargetVisitorRequest):
    # mbox 이름은 클라이언트가 직접 보내지 않아도 된다. 비우면 서버가 config.adobe.json 의
    # mbox 이름을 단일 소스로 결정한다(bootstrap=True → bootstrap_mbox_name, 그 외 → offer_mbox_name).
    mbox_name: Optional[str] = None
    bootstrap: bool = False
    params: Optional[Dict[str, str]] = None


def _resolve_offer_mbox_name(body: OffersRequest) -> str:
    """offers 기본(primary) mbox 이름 결정: 본문 지정값 > bootstrap_mbox_name > offer_mbox_name."""
    explicit = (body.mbox_name or "").strip()
    if explicit:
        return explicit
    settings = get_adobe_target_settings()
    return settings.bootstrap_mbox_name if body.bootstrap else settings.offer_mbox_name


def _resolve_offers_mbox_names(body: OffersRequest, primary_name: str) -> list[str]:
    """offers 요청에 실을 mbox 이름 목록.

    bootstrap 이고 본문에 mbox 를 직접 지정하지 않은 경우에만 배너 전용 mbox(banner_mbox_names)를
    primary mbox 뒤에 동봉한다. 배너는 각자 전용 mbox = 각자 독립 활동이라 location 충돌이 없다.
    """
    names = [primary_name]
    explicit = (body.mbox_name or "").strip()
    if body.bootstrap and not explicit:
        for banner in get_adobe_target_settings().banner_mbox_names:
            if banner and banner not in names:
                names.append(banner)
    return names


def _get_offers_sync(body: OffersRequest) -> Dict[str, Any]:
    delivery_id = build_delivery_id(body.tnt_id, body.third_party_id)
    primary_name = _resolve_offer_mbox_name(body)
    # page_url 은 요청 바디로만 수신하며, DeliveryRequest·Context 구성에는 연결되지 않는다.

    mbox_names = _resolve_offers_mbox_names(body, primary_name)
    mboxes = [
        MboxRequest(name=name, index=i, parameters=body.params or None)
        for i, name in enumerate(mbox_names)
    ]
    response = _run_delivery(
        "offers",
        delivery_id,
        mboxes,
        cookie=body.target_cookie,
        hint=body.target_location_hint,
        session=body.session_id,
    )

    resp = response.get("response") if response else None
    result: Dict[str, Any] = {
        "mbox": primary_name,
        "mboxes": mbox_names,
        "offers": offers_from_execute(resp) if resp else [],
        **_id_and_cookies(response, (body.third_party_id or "").strip() or None),
    }
    return result


@router.post("/target/offers")
async def get_offers_endpoint(body: OffersRequest) -> Dict[str, Any]:
    try:
        return await asyncio.to_thread(_get_offers_sync, body)
    except Exception as exc:
        _handle_error(exc, "offers")


# ── profile-test 엔드포인트 ──

class ProfileTestRequest(_TargetVisitorRequest):
    """offers 와 동일한 방문자 필드 + `params` 대신 `profile_params`. mbox 기본은 offer_mbox_name(설정 단일 소스)."""

    mbox_name: str = Field(default_factory=lambda: get_adobe_target_settings().offer_mbox_name)
    profile_params: Optional[Dict[str, str]] = None


def _profile_test_sync(body: ProfileTestRequest) -> Dict[str, Any]:
    delivery_id = build_delivery_id(body.tnt_id, body.third_party_id)

    # offers 와 동일 mbox 로 호출해야 Audience·Profile Script 조건이 같은 컨텍스트에서 평가된다.
    # 차이는 `parameters` 대신 `profile_parameters` 슬롯 사용 — 값이 Adobe 프로필에 저장된다.
    mbox = MboxRequest(
        name=body.mbox_name,
        index=0,
        profile_parameters=body.profile_params or None,
    )
    response = _run_delivery(
        "profile_test",
        delivery_id,
        [mbox],
        cookie=body.target_cookie,
        hint=body.target_location_hint,
        session=body.session_id,
    )

    resp = response.get("response") if response else None
    offers = offers_from_execute(resp, parse_json=True) if resp else []
    result: Dict[str, Any] = {
        "mbox": body.mbox_name,
        "status": getattr(resp, "status", None) if resp else None,
        "request_id": getattr(resp, "request_id", None) if resp else None,
        "offers": offers,
        "response_tokens": [
            {"source": o.get("source"), "mbox_name": o.get("mbox_name"), "tokens": o["response_tokens"]}
            for o in offers
            if o.get("response_tokens")
        ],
        **_id_and_cookies(response, (body.third_party_id or "").strip() or None),
    }
    return result


@router.post("/target/profile-test")
async def profile_test_endpoint(body: ProfileTestRequest) -> Dict[str, Any]:
    try:
        return await asyncio.to_thread(_profile_test_sync, body)
    except Exception as exc:
        _handle_error(exc, "profile_test")


# ── recommendation-test 엔드포인트 (Recommendations mbox, 이름은 config.adobe.json `mboxes.recs_mbox_name`) ──

CUSTOMER_ATTR_INTEGRATION_CODE = "recipient_id"


class RecommendationTestRequest(BaseModel):
    """Recommendation 테스트 요청(entity·가격·주문 컨텍스트)."""

    model_config = ConfigDict(populate_by_name=True)

    entity_id: str
    entity_category_id: Optional[str] = None
    recipient_id: Optional[str] = None
    price: Optional[float] = Field(1000, ge=0)
    tnt_id: Optional[str] = Field(None, validation_alias=AliasChoices("tntId", "tnt_id"))
    target_cookie: Optional[str] = None
    target_location_hint: Optional[str] = None


def _recommendation_test_sync(body: RecommendationTestRequest) -> Dict[str, Any]:
    # 1. [Recommendations] Delivery execute: thirdPartyId + 선택 customerIds, product·order·parameters
    settings = get_adobe_target_settings()
    recs_mbox_name = settings.recs_mbox_name
    recipient_trim = (body.recipient_id or "").strip()
    third_party_id = recipient_trim or str(uuid.uuid4())

    customer_ids_list: Optional[list[CustomerId]] = None
    if recipient_trim:
        customer_ids_list = [
            CustomerId(
                id=recipient_trim,
                integration_code=CUSTOMER_ATTR_INTEGRATION_CODE,
                authenticated_state=AuthenticatedState.AUTHENTICATED,
            )
        ]

    cat_raw = (body.entity_category_id or "").strip()
    cat_for_entity = "" if (not cat_raw or cat_raw.lower() == "ss") else cat_raw
    mbox_params: Dict[str, str] = {
        "entity.id": body.entity_id,
        "entity.categoryId": cat_for_entity,
    }
    order_id = f"ord_{uuid.uuid4().hex[:12]}"
    total = float(body.price) if body.price is not None else 1000.0

    mbox = MboxRequest(
        name=recs_mbox_name,
        index=0,
        parameters=mbox_params,
        product=Product(id=body.entity_id, category_id=cat_for_entity),
        order=Order(
            id=order_id,
            total=total,
            purchased_product_ids=[body.entity_id],
        ),
    )

    def _fetch_with_visitor_ids(customer_ids_param: Optional[list[CustomerId]]) -> Any:
        delivery_id = build_delivery_id(body.tnt_id, third_party_id, customer_ids_param)
        return _run_delivery(
            "recommendation_test",
            delivery_id,
            [mbox],
            cookie=body.target_cookie,
            hint=body.target_location_hint,
        )

    try:
        response = _fetch_with_visitor_ids(customer_ids_list)
    except Exception as exc:
        if customer_ids_list is None:
            raise
        logger.warning(
            "[AT] recommendation_test: customerIds 경로 실패, thirdPartyId 단독 재시도. error=%s",
            exc,
        )
        response = _fetch_with_visitor_ids(None)

    resp = response.get("response") if response else None
    raw_offers = offers_from_execute(resp, parse_json=True) if resp else []
    out: Dict[str, Any] = {
        "mbox": recs_mbox_name,
        "status": getattr(resp, "status", None) if resp else None,
        "request_id": getattr(resp, "request_id", None) if resp else None,
        "offers": raw_offers,
        "response_tokens": [],
        **_id_and_cookies(response, third_party_id),
    }

    recommendations: list[Any] = []
    recommendations_meta: Dict[str, Any] = {}
    for offer in raw_offers:
        content = offer.get("content")
        if isinstance(content, dict):
            meta = content.get("meta", {})
            if isinstance(meta, dict):
                recommendations_meta.update(meta)
            rec_list = content.get("items", [])
            if not isinstance(rec_list, list):
                rec_list = []
            recommendations.extend(rec_list)
        elif isinstance(content, list):
            recommendations.extend(content)
        else:
            pass
    out["recommendations"] = recommendations
    out["recommendations_meta"] = recommendations_meta

    return out


@router.post("/target/recommendation-test")
async def recommendation_test_endpoint(body: RecommendationTestRequest) -> Dict[str, Any]:
    try:
        return await asyncio.to_thread(_recommendation_test_sync, body)
    except Exception as exc:
        _handle_error(exc, "recommendation_test")
