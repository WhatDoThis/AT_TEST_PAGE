"""
adobe_backend.target_backend.target_debug_utils (Adobe Target 디버그 로그 유틸)
================================================================================
Adobe Delivery 요청/응답의 진단 로그를 공통 함수로 분리한다.
환경변수 `AT_DEBUG_DELIVERY`가 켜졌을 때만 상세 로그를 출력한다.

[Main Functions]
===========
- at_debug_log_request: DeliveryRequest 요약 + to_str 분할 로깅
- at_debug_log_response: SDK response execute/pageLoad/mboxes 상세 로깅

[Endpoints/Classes/Functions]
=======================
- at_debug_log_request(logger, label, delivery_request)
- at_debug_log_response(logger, label, sdk_response)

[Dependencies]
=========
- 표준 라이브러리 os
- delivery_api_client.DeliveryRequest
"""

from __future__ import annotations

import os
from typing import Any, Optional

from delivery_api_client import DeliveryRequest

_AT_DEBUG_ENV = "AT_DEBUG_DELIVERY"
_AT_DEBUG_CHUNK = 3000


# 1. [토글] 환경변수로 디버그 로그 활성 여부를 판단한다.
def _at_debug_enabled() -> bool:
    return os.getenv(_AT_DEBUG_ENV, "").strip().lower() in {"1", "true", "yes", "on"}


# 2. [요약] DeliveryRequest 핵심 필드를 한 줄 문자열로 만든다.
def _at_debug_request_summary(delivery_request: DeliveryRequest) -> str:
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
    visitor = getattr(delivery_request, "id", None)
    tnt = getattr(visitor, "tnt_id", None) if visitor is not None else None
    prop = getattr(delivery_request, "_property", None)
    prop_token = getattr(prop, "token", None) if prop is not None else None
    return (
        f"mode={mode} "
        f"execute_mboxes={mbox_names or '-'} "
        f"page_url={page_url or '-'} "
        f"tntId={tnt or '-'} "
        f"property_token={prop_token or '-'}"
    )


# 3. [분할] 긴 문자열을 일정 크기로 잘라 로그에 기록한다.
def _at_debug_log_chunked(logger: Any, label: str, kind: str, full_str: str) -> None:
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


# 4. [요청 로그] DeliveryRequest 요약/본문을 기록한다.
def at_debug_log_request(logger: Any, label: str, delivery_request: DeliveryRequest) -> None:
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
        logger.warning("[AT DEBUG] %s to_str fail: %r", label, exc)
        return
    _at_debug_log_chunked(logger, label, "request to_str", full_str)


# 5. [응답 로그] SDK 응답 execute/pageLoad/mboxes 및 to_dict를 기록한다.
def at_debug_log_response(logger: Any, label: str, sdk_response: Optional[dict[str, Any]]) -> None:
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
    try:
        resp_dict_str = repr(resp_obj.to_dict())
    except Exception as exc:  # noqa: BLE001
        resp_dict_str = f"<to_dict fail: {exc!r}>"
    _at_debug_log_chunked(logger, label, "response.to_dict()", resp_dict_str)
