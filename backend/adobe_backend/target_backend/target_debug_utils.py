"""AT_DEBUG_DELIVERY=1 일 때 Delivery 요청/응답 진단 로그."""

from __future__ import annotations

import os
from typing import Any, Optional

from delivery_api_client import DeliveryRequest

_ENV = "AT_DEBUG_DELIVERY"
_CHUNK = 3000


def _enabled() -> bool:
    return os.getenv(_ENV, "").strip().lower() in {"1", "true", "yes", "on"}


def _summarize_request(dr: DeliveryRequest) -> str:
    ex = dr.execute
    vid = dr.id
    prop = dr._property
    if ex and ex.mboxes:
        mode, names = "mboxes", [m.name for m in ex.mboxes]
    elif ex and ex.page_load:
        addr = ex.page_load.address
        mode, names = "pageLoad", [addr.url if addr else "-"]
    else:
        mode, names = "n/a", []
    return (
        f"mode={mode} mboxes={names} "
        f"tntId={getattr(vid, 'tnt_id', None) or '-'} "
        f"thirdPartyId={getattr(vid, 'third_party_id', None) or '-'} "
        f"token={getattr(prop, 'token', None) or '-'}"
    )


def _log_chunked(logger: Any, label: str, kind: str, full_str: str) -> None:
    total = len(full_str)
    parts = max(1, -(-total // _CHUNK))
    for i in range(parts):
        start = i * _CHUNK
        end = start + _CHUNK
        logger.warning(
            "[Adobe Target DEBUG] %s %s (%d/%d, %d chars): %s",
            label,
            kind,
            i + 1,
            parts,
            total,
            full_str[start:end],
        )


def at_debug_log_request(logger: Any, label: str, delivery_request: DeliveryRequest) -> None:
    if not _enabled():
        return
    logger.warning(
        "[Adobe Target DEBUG] %s request summary: %s",
        label,
        _summarize_request(delivery_request),
    )
    try:
        full_str = delivery_request.to_str()
    except Exception as exc:  # noqa: BLE001
        logger.warning("[AT DEBUG] %s to_str fail: %r", label, exc)
        return
    _log_chunked(logger, label, "request to_str", full_str)


def at_debug_log_response(logger: Any, label: str, sdk_response: Optional[dict[str, Any]]) -> None:
    if not _enabled():
        return
    if not sdk_response or not sdk_response.get("response"):
        logger.warning("[AT DEBUG] %s response empty", label)
        return
    resp = sdk_response["response"]
    logger.warning(
        "[AT DEBUG] %s status=%s req_id=%s client=%s",
        label,
        resp.status,
        resp.request_id,
        resp.client,
    )
    ex = resp.execute
    if ex:
        pl_count = len(ex.page_load.options) if ex.page_load and ex.page_load.options else 0
        mb_count = sum(len(m.options or []) for m in (ex.mboxes or []))
        logger.warning("[AT DEBUG] %s pageLoad_opts=%d mbox_opts=%d", label, pl_count, mb_count)
    try:
        _log_chunked(logger, label, "to_dict", repr(resp.to_dict()))
    except Exception:  # noqa: BLE001
        logger.warning("[AT DEBUG] %s to_dict failed", label)
