"""
adobe_backend.target_backend.target_adobe_router (Adobe Target API 라우터)
================================================================================
프론트엔드에서 호출하는 Adobe Target 프록시 엔드포인트를 제공한다.
- POST /api/target/offers: 오퍼 조회 (페이지 로드 시)
- POST /api/target/track: 클릭 이벤트 전송

[Main Functions]
===========
- get_offers: Adobe Target get_offers 호출 및 오퍼 파싱(asyncio.to_thread로 동기 SDK 비블로킹)
- track_click: Adobe Target send_notifications 호출(동일)
- _get_offers_sync / _track_click_sync: 스레드에서 실행되는 동기 Target 호출 본문
- _new_client_tnt_id / _build_delivery_visitor_id / _tnt_id_from_delivery_response: VisitorId(tntId) 생성·응답 tntId 추출
- _is_target_global_mbox / _offers_from_execute_response: 글로벌 mbox → pageLoad·응답 옵션 파싱
- _at_debug_*: 환경변수 `AT_DEBUG_DELIVERY` 토글 진단(offers는 execute 상세, track은 알림 전용 응답으로 execute 생략)
- DeliveryRequest.id(VisitorId): tntId·thirdPartyId·marketingCloudVisitorId 중 하나 필수 — `tnt_id` 미전달 시 `{uuid.hex}.28_0` 클라이언트 tntId 생성(응답 id.tntId 우선 반환)
- `OffersRequest` / `TrackRequest` 의 `mbox_name` 기본값은 `get_settings().adobe_target.offer_mbox_name` / `track_mbox_name`(JSON 생략 시 폴백: 글로벌 mbox·click-tracking-mbox)
- AdobeTargetConfigError → HTTP 400(설정 비ASCII·빈 값)
- urllib3 LocationParseError → HTTP 400(delivery URL 파싱 실패 시 캐시 무효화 후 재시도 가능)
- delivery ApiException(400) → HTTP 400(Adobe 본문 전달)
- 기타 예외 → HTTP 502(detail에 reason·message 포함)

[Endpoints/Classes/Functions]
=======================
- POST /target/offers
- POST /target/track

[Dependencies]
=========
- fastapi
- pydantic
- urllib3.exceptions.LocationParseError
- app.config.get_settings
- adobe_backend.target_backend.target_client
- delivery_api_client (DeliveryRequest·ExecuteRequest·RequestDetails·Address·VisitorId·ApiException 등)
- six, python-dateutil, urllib3, certifi (delivery_api_client 전이 의존성)
- asyncio (동기 SDK를 to_thread로 오프로딩)
"""

# ════════════════════════════════════════════════════════════════════════════════
# ████████  ADOBE TARGET 전용 파일 — 전체 코드가 Adobe Target 연동용  ████████
# ════════════════════════════════════════════════════════════════════════════════

from __future__ import annotations

import asyncio
import logging
import uuid
from datetime import datetime
from typing import Any, Dict, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from urllib3.exceptions import LocationParseError

from app.config import get_settings

from delivery_api_client import (
    Address,
    ChannelType,
    Context,
    DeliveryRequest,
    ExecuteRequest,
    MboxRequest,
    MetricType,
    ModelProperty,  # ── Adobe Target ── OpenAPI `property` 스키마 → 생성기가 ModelProperty로 명명
    Notification,
    NotificationMbox,
    RequestDetails,
    VisitorId,
)
from delivery_api_client.exceptions import ApiException

from adobe_backend.target_backend.target_client import (
    AdobeTargetConfigError,
    get_property_token,
    get_target_client,
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


# ── Adobe Target ── 진단 로그(`AT_DEBUG_DELIVERY=1`): 장애·빈 오퍼 원인 조사 시에만 켠다(기본 OFF).
# - offers: 요청 summary + to_str 분할 + 응답 execute(pageLoad/mboxes) 상세 + to_dict 분할.
# - track(send_notifications): 요청 summary + to_str 분할 + 응답은 execute 비어 있음이 정상 → execute 분기 생략.
import os as _at_debug_os  # noqa: E402

_AT_DEBUG_ENV = "AT_DEBUG_DELIVERY"
_AT_DEBUG_CHUNK = 3000


def _at_debug_enabled() -> bool:
    return _at_debug_os.getenv(_AT_DEBUG_ENV, "").strip().lower() in {"1", "true", "yes", "on"}


def _at_debug_request_summary(delivery_request: DeliveryRequest) -> str:
    """요청 헤더 한 줄 요약(전송 모드·mbox 이름·page_url·visitorId)."""
    execute = getattr(delivery_request, "execute", None)
    mode = "n/a"
    mbox_names: list[str] = []
    page_url: Optional[str] = None
    if execute is not None:
        page_load = getattr(execute, "page_load", None)
        mboxes = getattr(execute, "mboxes", None) or []
        if mboxes:
            mode = "mboxes"
            mbox_names = [getattr(m, "name", None) or "?" for m in mboxes]
        elif page_load is not None:
            mode = "pageLoad"
            address = getattr(page_load, "address", None)
            page_url = getattr(address, "url", None) if address is not None else None
    notif = getattr(delivery_request, "notifications", None) or []
    notif_mboxes: list[str] = []
    if notif:
        mode = mode if mode != "n/a" else "notifications"
        for n in notif:
            mb = getattr(n, "mbox", None)
            if mb is not None:
                notif_mboxes.append(getattr(mb, "name", None) or "?")
    visitor = getattr(delivery_request, "id", None)
    tnt = getattr(visitor, "tnt_id", None) if visitor is not None else None
    third = getattr(visitor, "third_party_id", None) if visitor is not None else None
    prop = getattr(delivery_request, "_property", None)
    prop_token = getattr(prop, "token", None) if prop is not None else None
    return (
        f"mode={mode} "
        f"execute_mboxes={mbox_names or '-'} "
        f"page_url={page_url or '-'} "
        f"notification_mboxes={notif_mboxes or '-'} "
        f"tntId={tnt or '-'} thirdPartyId={third or '-'} "
        f"property_token={prop_token or '-'}"
    )


def _at_debug_log_chunked(label: str, kind: str, full_str: str) -> None:
    """긴 문자열을 _AT_DEBUG_CHUNK 단위로 분할 로깅."""
    total = len(full_str)
    parts = max(1, -(-total // _AT_DEBUG_CHUNK))
    for i in range(parts):
        start = i * _AT_DEBUG_CHUNK
        end = start + _AT_DEBUG_CHUNK
        logger.warning(
            "[Adobe Target DEBUG] %s %s (%d/%d, %d chars): %s",
            label,
            kind,
            i + 1,
            parts,
            total,
            full_str[start:end],
        )


def _at_debug_log_request(label: str, delivery_request: DeliveryRequest) -> None:
    """요청 본문(to_str)을 분할 로깅. ApiClient/Configuration 직접 사용 금지."""
    if not _at_debug_enabled():
        return
    logger.warning(
        "[Adobe Target DEBUG] %s request summary: %s",
        label,
        _at_debug_request_summary(delivery_request),
    )
    try:
        full_str = delivery_request.to_str()
    except Exception as exc:  # noqa: BLE001
        logger.warning("[Adobe Target DEBUG] %s to_str failed: %r", label, exc)
        return
    _at_debug_log_chunked(label, "request to_str", full_str)


def _at_debug_log_response(
    label: str,
    sdk_response: Optional[Dict[str, Any]],
    *,
    parse_execute: bool = True,
) -> None:
    """SDK 응답 진단 로깅. parse_execute=False 이면 send_notifications 응답(execute 비어 있음이 정상)."""
    if not _at_debug_enabled():
        return
    if not sdk_response:
        logger.warning("[Adobe Target DEBUG] %s sdk_response is falsy", label)
        return
    resp_obj = sdk_response.get("response")
    if resp_obj is None:
        logger.warning(
            "[Adobe Target DEBUG] %s response object is None (sdk meta keys=%s)",
            label,
            list(sdk_response.keys()),
        )
        return
    logger.warning(
        "[Adobe Target DEBUG] %s response.status=%r request_id=%r client=%r edge_host=%r",
        label,
        getattr(resp_obj, "status", None),
        getattr(resp_obj, "request_id", None),
        getattr(resp_obj, "client", None),
        getattr(resp_obj, "edge_host", None),
    )
    if parse_execute:
        execute = getattr(resp_obj, "execute", None)
        if execute is None:
            logger.warning(
                "[Adobe Target DEBUG] %s execute is None (offers 응답인데 비어 있으면 오퍼 미매칭 가능)",
                label,
            )
        else:
            page_load = getattr(execute, "page_load", None)
            if page_load is None:
                logger.warning("[Adobe Target DEBUG] %s execute.page_load is None", label)
            else:
                options = getattr(page_load, "options", None) or []
                logger.warning(
                    "[Adobe Target DEBUG] %s execute.page_load.options count=%d preview=%s",
                    label,
                    len(options),
                    [getattr(o, "type", None) for o in options][:5],
                )
                for idx, opt in enumerate(options[:3]):
                    logger.warning(
                        "[Adobe Target DEBUG] %s pageLoad.option[%d] type=%r content=%r",
                        label,
                        idx,
                        getattr(opt, "type", None),
                        getattr(opt, "content", None),
                    )
            mboxes = getattr(execute, "mboxes", None) or []
            logger.warning(
                "[Adobe Target DEBUG] %s execute.mboxes count=%d names=%s",
                label,
                len(mboxes),
                [getattr(m, "name", None) for m in mboxes],
            )
            for idx, m in enumerate(mboxes[:5]):
                opts = getattr(m, "options", None) or []
                logger.warning(
                    "[Adobe Target DEBUG] %s mbox[%d] name=%r options_count=%d preview=%s",
                    label,
                    idx,
                    getattr(m, "name", None),
                    len(opts),
                    [(getattr(o, "type", None), getattr(o, "content", None)) for o in opts][:3],
                )
        prefetch = getattr(resp_obj, "prefetch", None)
        if prefetch is not None:
            logger.warning("[Adobe Target DEBUG] %s prefetch present=%r", label, bool(prefetch))
    else:
        logger.warning(
            "[Adobe Target DEBUG] %s response: execute/prefetch 분기 생략(send_notifications 정상 응답)",
            label,
        )
    # ── Adobe Target ── 응답 객체 전체(to_dict) 분할 로깅 — meta·edge_host·client·trace 등 단서 확인용
    try:
        resp_dict_str = repr(resp_obj.to_dict())
    except Exception as exc:  # noqa: BLE001
        resp_dict_str = f"<to_dict failed: {exc!r}>"
    _at_debug_log_chunked(label, "response.to_dict()", resp_dict_str)


# ── Adobe Target ── Delivery `execute.mboxes`에는 글로벌 mbox 이름을 넣을 수 없음(NoGlobalMbox). pageLoad로만 요청한다.
_TARGET_GLOBAL_MBOX_NAME = "target-global-mbox"
# ── Adobe Target ── pageLoad.address.url 미지정 시 폴백(프론트에서 `page_url` 전달 권장)
_DEFAULT_TARGET_PAGE_LOAD_URL = "http://127.0.0.1/"


# 0. [캐시] JSON 수정 후 재요청 시 디스크 설정·SDK 클라이언트를 다시 읽게 한다.
def _clear_settings_and_target_client_caches() -> None:
    get_settings.cache_clear()
    get_target_client.cache_clear()


# 0.4 [Adobe API] OpenAPI 클라이언트 예외 본문을 HTTP detail 문자열로 만든다.
def _api_exception_body_text(exc: ApiException) -> str:
    raw = exc.body
    if raw is None:
        return str(exc)
    if isinstance(raw, (bytes, bytearray)):
        return bytes(raw).decode("utf-8", errors="replace")
    return str(raw)


# ── Adobe Target ── 요청 JSON 에서 mbox_name 생략 시 backend/env/config.adobe.json 의 값과 프론트 키명을 맞춘다.
def _default_offer_mbox_name_from_settings() -> str:
    return get_settings().adobe_target.offer_mbox_name


def _default_track_mbox_name_from_settings() -> str:
    return get_settings().adobe_target.track_mbox_name


# ── Adobe Target ── 오퍼 조회 요청 모델
class OffersRequest(BaseModel):
    mbox_name: str = Field(default_factory=_default_offer_mbox_name_from_settings)
    # ── Adobe Target ── `target-global-mbox`일 때 execute.pageLoad.address.url 로 쓰임(미입력 시 서버 폴백 URL).
    page_url: Optional[str] = None
    # ── Adobe Target ── 이전 응답의 `tnt_id` 재사용(우선). 없으면 백엔드가 `{uuid.hex}.28_0` 형 클라이언트 tntId를 만든다(SDK 자동 생성 없음).
    tnt_id: Optional[str] = None
    # ── Adobe Target ── thirdPartyId(레거시·간단 식별). `tnt_id`와 동시 전달 시 둘 다 VisitorId에 실린다.
    visitor_id: Optional[str] = None
    params: Optional[Dict[str, str]] = None


# ── Adobe Target ── 클릭 추적 요청 모델
class TrackRequest(BaseModel):
    mbox_name: str = Field(default_factory=_default_track_mbox_name_from_settings)
    tnt_id: Optional[str] = None  # ── Adobe Target ── offers와 동일
    visitor_id: Optional[str] = None  # ── Adobe Target ── thirdPartyId
    params: Dict[str, str] = Field(default_factory=dict)


# ── Adobe Target ── 익명 방문자용 클라이언트 생성 tntId 접미사(프로필 클러스터 힌트). 필요 시 환경에 맞게 조정.
_DEFAULT_TNT_CLUSTER_HINT = "28_0"


# 0.1 [VisitorId] Adobe는 tntId·thirdPartyId·marketingCloudVisitorId 중 하나가 필수다(SDK가 자동 생성하지 않음).
def _new_client_tnt_id() -> str:
    return f"{uuid.uuid4().hex}.{_DEFAULT_TNT_CLUSTER_HINT}"


# 0.2 [VisitorId] 요청 문자열로 `delivery_api_client` VisitorId를 만든다. 반환: (모델, 보낸 tntId 또는 None, thirdParty 또는 None)
def _build_delivery_visitor_id(tnt_id: Optional[str], visitor_id: Optional[str]) -> tuple[VisitorId, Optional[str], Optional[str]]:
    t = (tnt_id or "").strip()
    v = (visitor_id or "").strip()
    if t and v:
        return VisitorId(tnt_id=t, third_party_id=v), t, v
    if t:
        return VisitorId(tnt_id=t), t, None
    if v:
        return VisitorId(third_party_id=v), None, v
    gen = _new_client_tnt_id()
    return VisitorId(tnt_id=gen), gen, None


# 0.3 [VisitorId] Delivery 응답에서 정식 tntId가 있으면 다음 요청 재사용용으로 돌려준다.
def _tnt_id_from_delivery_response(resp: Any) -> Optional[str]:
    rid = getattr(resp, "id", None)
    if rid is None:
        return None
    t = getattr(rid, "tnt_id", None)
    if isinstance(t, str) and t.strip():
        return t.strip()
    return None


# 0.5 [Adobe Target] 글로벌 mbox는 pageLoad, 그 외 이름은 regional mboxes 배열로 execute를 만든다.
def _is_target_global_mbox(mbox_name: str) -> bool:
    return (mbox_name or "").strip().lower() == _TARGET_GLOBAL_MBOX_NAME


# 0.6 [Adobe Target] ExecuteResponse에서 오퍼 옵션 목록을 추출한다(pageLoad·mboxes 둘 다 처리).
def _offers_from_execute_response(resp: Any) -> list[dict[str, Any]]:
    offers: list[dict[str, Any]] = []
    if not hasattr(resp, "execute") or not resp.execute:
        return offers
    ex = resp.execute
    pl = getattr(ex, "page_load", None)
    if pl is not None and getattr(pl, "options", None):
        for option in pl.options or []:
            offers.append(
                {
                    "type": option.type if hasattr(option, "type") else "unknown",
                    "content": option.content if hasattr(option, "content") else None,
                }
            )
    for mbox_resp in ex.mboxes or []:
        for option in (mbox_resp.options or []):
            offers.append(
                {
                    "type": option.type if hasattr(option, "type") else "unknown",
                    "content": option.content if hasattr(option, "content") else None,
                }
            )
    return offers


# 1. [동기·스레드] Adobe Target get_offers 본문 — async 엔드포인트에서는 to_thread로만 호출한다.
def _get_offers_sync(body: OffersRequest) -> Dict[str, Any]:
    client = get_target_client()
    property_token = get_property_token()
    # ── Adobe Target ── SDK는 visitorId를 채워주지 않으므로 tntId 또는 thirdPartyId를 명시한다.
    visitor_model, tnt_sent, third_sent = _build_delivery_visitor_id(body.tnt_id, body.visitor_id)

    if _is_target_global_mbox(body.mbox_name):
        page_url = (body.page_url or "").strip() or _DEFAULT_TARGET_PAGE_LOAD_URL
        page_load = RequestDetails(
            address=Address(url=page_url),
            parameters=body.params or {},
        )
        execute = ExecuteRequest(page_load=page_load)
    else:
        mbox = MboxRequest(
            name=body.mbox_name,
            index=0,
            parameters=body.params or {},
        )
        execute = ExecuteRequest(mboxes=[mbox])

    delivery_request = DeliveryRequest(
        id=visitor_model,
        context=Context(channel=ChannelType.WEB),
        execute=execute,
        _property=ModelProperty(token=property_token),  # ── Adobe Target ── DeliveryRequest 필드명은 _property
    )

    # ── Adobe Target ── 진단: AT_DEBUG_DELIVERY=1 일 때 요청 본문 분할 로깅
    _at_debug_log_request("get_offers", delivery_request)

    target_opts: Dict[str, Any] = {"request": delivery_request}

    response = client.get_offers(target_opts)

    # ── Adobe Target ── 진단: 응답 execute 상세(offers 전용)
    _at_debug_log_response("get_offers", response)

    offers: list[dict[str, Any]] = []
    response_tnt: Optional[str] = None
    if response and response.get("response"):
        resp = response["response"]
        response_tnt = _tnt_id_from_delivery_response(resp)
        offers = _offers_from_execute_response(resp)

    # ── Adobe Target ── 다음 호출에는 응답의 정식 tntId(있으면)를 재사용하는 것이 권장된다.
    tnt_for_client = response_tnt or tnt_sent
    out: Dict[str, Any] = {"offers": offers, "mbox": body.mbox_name}
    if tnt_for_client:
        out["tnt_id"] = tnt_for_client
    if third_sent:
        out["visitor_third_party_id"] = third_sent
    return out


# 2. [동기·스레드] Adobe Target send_notifications 본문
def _track_click_sync(body: TrackRequest) -> Dict[str, Any]:
    client = get_target_client()
    property_token = get_property_token()
    # ── Adobe Target ──
    visitor_model, tnt_sent, third_sent = _build_delivery_visitor_id(body.tnt_id, body.visitor_id)

    notification = Notification(
        id=str(uuid.uuid4()),
        impression_id=str(uuid.uuid4()),
        type=MetricType.CLICK,
        timestamp=int(datetime.now().timestamp() * 1000),
        mbox=NotificationMbox(name=body.mbox_name),
        tokens=[],  # 오퍼에서 받은 eventToken이 있으면 여기에 설정
        parameters=body.params,
    )

    delivery_request = DeliveryRequest(
        id=visitor_model,
        context=Context(channel=ChannelType.WEB),
        notifications=[notification],
        _property=ModelProperty(token=property_token),  # ── Adobe Target ──
    )

    # ── Adobe Target ── 진단(track): AT_DEBUG_DELIVERY=1 일 때 요청 본문 분할 로깅
    _at_debug_log_request("track_click", delivery_request)

    response = client.send_notifications({"request": delivery_request})

    # ── Adobe Target ── 진단(track): 응답은 execute 없음이 정상 → parse_execute=False
    _at_debug_log_response("track_click", response, parse_execute=False)

    response_tnt: Optional[str] = None
    if response and response.get("response"):
        response_tnt = _tnt_id_from_delivery_response(response["response"])
    tnt_for_client = response_tnt or tnt_sent
    logger.info("Adobe Target track sent: mbox=%s params=%s", body.mbox_name, body.params)
    out: Dict[str, Any] = {"status": "ok", "mbox": body.mbox_name}
    if tnt_for_client:
        out["tnt_id"] = tnt_for_client
    if third_sent:
        out["visitor_third_party_id"] = third_sent
    return out


# ── Adobe Target ── 오퍼 조회 엔드포인트
@router.post("/target/offers")
async def get_offers(body: OffersRequest) -> Dict[str, Any]:
    try:
        return await asyncio.to_thread(_get_offers_sync, body)
    except AdobeTargetConfigError as exc:
        logger.warning("Adobe Target get_offers config invalid: %s", exc)
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except LocationParseError as exc:
        _clear_settings_and_target_client_caches()
        logger.warning("Adobe Target get_offers URL parse failed (check backend/env/config.adobe.json ASCII): %s", exc)
        raise HTTPException(
            status_code=400,
            detail=(
                "Adobe Target delivery URL could not be parsed (invalid or non-ASCII client/organization in "
                f"config). urllib3: {exc}"
            ),
        ) from exc
    except ApiException as exc:
        body_text = _api_exception_body_text(exc)[:4000]
        if exc.status == 400:
            logger.warning("Adobe Target get_offers API 400: %s", body_text[:800])
            raise HTTPException(status_code=400, detail=body_text) from exc
        logger.error("Adobe Target get_offers API error status=%s", exc.status)
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
        logger.exception("Adobe Target get_offers failed: %s", exc)
        raise HTTPException(
            status_code=502,
            detail={
                "code": "adobe_target_unavailable",
                "reason": type(exc).__name__,
                "message": str(exc)[:800],
            },
        ) from exc


# ── Adobe Target ── 클릭 추적 엔드포인트
@router.post("/target/track")
async def track_click(body: TrackRequest) -> Dict[str, Any]:
    try:
        return await asyncio.to_thread(_track_click_sync, body)
    except AdobeTargetConfigError as exc:
        logger.warning("Adobe Target track config invalid: %s", exc)
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except LocationParseError as exc:
        _clear_settings_and_target_client_caches()
        logger.warning("Adobe Target track URL parse failed (check backend/env/config.adobe.json ASCII): %s", exc)
        raise HTTPException(
            status_code=400,
            detail=(
                "Adobe Target delivery URL could not be parsed (invalid or non-ASCII client/organization in "
                f"config). urllib3: {exc}"
            ),
        ) from exc
    except ApiException as exc:
        body_text = _api_exception_body_text(exc)[:4000]
        if exc.status == 400:
            logger.warning("Adobe Target track API 400: %s", body_text[:800])
            raise HTTPException(status_code=400, detail=body_text) from exc
        logger.error("Adobe Target track API error status=%s", exc.status)
        raise HTTPException(
            status_code=502,
            detail={
                "code": "adobe_target_track_failed",
                "reason": type(exc).__name__,
                "status": exc.status,
                "message": body_text[:800],
            },
        ) from exc
    except Exception as exc:
        logger.exception("Adobe Target track failed: %s", exc)
        raise HTTPException(
            status_code=502,
            detail={
                "code": "adobe_target_track_failed",
                "reason": type(exc).__name__,
                "message": str(exc)[:800],
            },
        ) from exc
