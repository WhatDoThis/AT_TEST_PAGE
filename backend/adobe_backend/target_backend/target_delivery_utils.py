"""Delivery 요청 id(VisitorId)·오퍼 파싱·캐시 초기화·ApiException 본문. 의존: uuid, delivery_api_client, target_config, target_client."""

from __future__ import annotations

import uuid
from typing import Any, Optional

# OpenAPI Generator가 Delivery JSON의 `id` 객체를 VisitorId 클래스로 생성 (내장 id()와 충돌 회피).
# clickEvent 등 Audience 매칭용 값은 parameters(mbox params)로 전송한다.
# Custom Audience에서 즉시 매칭 가능. Visitor Profile(user.xxx)에 표시하려면 Target UI에서 Profile Script를 별도 작성해야 한다.
from delivery_api_client import VisitorId
from delivery_api_client.exceptions import ApiException

from adobe_backend.target_backend.target_client import get_target_client
from adobe_backend.target_backend.target_config import get_adobe_target_settings

TARGET_GLOBAL_MBOX = "target-global-mbox"
DEFAULT_TARGET_PAGE_LOAD_URL = "http://127.0.0.1/"


def build_delivery_id(
    tnt_id: Optional[str],
    third_party_id: Optional[str],
) -> tuple[VisitorId, Optional[str]]:
    """tntId·thirdPartyId로 VisitorId를 만든다. tntId 미전달 시 uuid.28_0 생성."""
    t = (tnt_id or "").strip() or f"{uuid.uuid4().hex}.28_0"
    tnt_for_client = (tnt_id or "").strip() or t
    tr = (third_party_id or "").strip()
    if tr:
        return VisitorId(tnt_id=t, third_party_id=tr), tnt_for_client
    return VisitorId(tnt_id=t), tnt_for_client


def extract_id_field(resp: Any, field: str) -> Optional[str]:
    """Delivery 응답 id 객체에서 지정 필드를 추출한다."""
    rid = getattr(resp, "id", None)
    val = getattr(rid, field, None) if rid else None
    return val.strip() if isinstance(val, str) and val.strip() else None


def offers_from_execute_response(resp: Any) -> list[dict[str, Any]]:
    offers: list[dict[str, Any]] = []
    if not getattr(resp, "execute", None) or not resp.execute:
        return offers
    ex = resp.execute
    if ex.page_load and ex.page_load.options:
        for option in ex.page_load.options:
            offers.append({"type": option.type, "content": option.content})
    for mbox_resp in ex.mboxes or []:
        for option in mbox_resp.options or []:
            offers.append({"type": option.type, "content": option.content})
    return offers


def clear_settings_and_target_client_caches() -> None:
    get_adobe_target_settings.cache_clear()
    get_target_client.cache_clear()


def api_exception_body_text(exc: ApiException) -> str:
    raw = exc.body
    if raw is None:
        return str(exc)
    if isinstance(raw, (bytes, bytearray)):
        return bytes(raw).decode("utf-8", errors="replace")
    return str(raw)
