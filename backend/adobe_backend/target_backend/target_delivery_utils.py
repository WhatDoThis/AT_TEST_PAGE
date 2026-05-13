"""
adobe_backend.target_backend.target_delivery_utils (Delivery ID·오퍼 파싱·캐시 초기화)
================================================================================
Target Delivery 요청의 VisitorId 구성, execute 응답에서 오퍼 목록 추출, 설정·클라이언트 캐시 초기화.

[Main Functions]
===========
- build_delivery_id
- extract_id_field / offers_from_execute
- clear_caches / api_exception_body

[Endpoints/Classes/Functions]
=======================
- build_delivery_id: tnt_id, third_party_id, customer_ids(Optional[list[CustomerId]]) → VisitorId
- offers_from_execute: execute.page_load·mboxes options 집계

[Dependencies]
=========
- delivery_api_client (VisitorId, CustomerId)
- target_client, target_config
"""

from __future__ import annotations

import json
from typing import Any, Optional

from delivery_api_client import CustomerId, VisitorId
from delivery_api_client.exceptions import ApiException

from adobe_backend.target_backend.target_client import get_target_client
from adobe_backend.target_backend.target_config import get_adobe_target_settings

DEFAULT_PAGE_URL = "http://127.0.0.1/"


def build_delivery_id(
    tnt_id: Optional[str] = None,
    third_party_id: Optional[str] = None,
    customer_ids: Optional[list[CustomerId]] = None,
) -> VisitorId:
    """VisitorId 생성. tnt·third_party·customer_ids 가 모두 비면 빈 VisitorId 로 Adobe tntId 자동 생성."""
    t = (tnt_id or "").strip() or None
    tr = (third_party_id or "").strip() or None
    cust = customer_ids if customer_ids else None
    if not t and not tr and not cust:
        return VisitorId()
    return VisitorId(tnt_id=t, third_party_id=tr, customer_ids=cust)


def extract_id_field(resp: Any, field: str) -> Optional[str]:
    """DeliveryResponse.id 에서 필드 추출."""
    rid = getattr(resp, "id", None)
    val = getattr(rid, field, None) if rid else None
    return val.strip() if isinstance(val, str) and val.strip() else None


def offers_from_execute(resp: Any, *, parse_json: bool = False) -> list[dict[str, Any]]:
    """execute.pageLoad + mboxes 의 모든 option 을 추출한다. parse_json=True 면 str content 를 dict 로 변환 시도."""
    if not getattr(resp, "execute", None):
        return []
    ex = resp.execute
    offers: list[dict[str, Any]] = []

    def _extract(options: list, source: str, mbox_name: Optional[str] = None) -> None:
        for opt in options or []:
            entry: dict[str, Any] = {"source": source, "type": getattr(opt, "type", None)}
            if mbox_name:
                entry["mbox_name"] = mbox_name
            content = getattr(opt, "content", None)
            if parse_json and isinstance(content, str):
                try:
                    content = json.loads(content)
                except (json.JSONDecodeError, ValueError):
                    pass
            entry["content"] = content
            rt = getattr(opt, "response_tokens", None)
            if rt:
                entry["response_tokens"] = rt
            offers.append(entry)

    if getattr(ex, "page_load", None) and ex.page_load.options:
        _extract(ex.page_load.options, "page_load")
    for mb in ex.mboxes or []:
        _extract(mb.options, "mbox", getattr(mb, "name", None))

    return offers


def clear_caches() -> None:
    get_adobe_target_settings.cache_clear()
    get_target_client.cache_clear()


def api_exception_body(exc: ApiException) -> str:
    raw = exc.body
    if raw is None:
        return str(exc)
    if isinstance(raw, (bytes, bytearray)):
        return bytes(raw).decode("utf-8", errors="replace")
    return str(raw)
