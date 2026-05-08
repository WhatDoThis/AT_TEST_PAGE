"""
adobe_backend.target_backend.target_delivery_utils (Adobe Delivery 공통 유틸)
================================================================================
라우터에서 재사용하는 Delivery 요청/응답 유틸을 분리한다.
방문자 ID 생성, 오퍼 파싱, 예외 본문 변환, 캐시 무효화를 담당한다.

[Main Functions]
===========
- build_delivery_visitor_id: tnt_id 기반 VisitorId 모델 생성
- tnt_id_from_delivery_response: Delivery 응답 id에서 tnt_id 추출
- offers_from_execute_response: execute.pageLoad/mboxes options 파싱
- clear_settings_and_target_client_caches: 설정/SDK 캐시 초기화
- api_exception_body_text: ApiException 본문 문자열화

[Endpoints/Classes/Functions]
=======================
- build_delivery_visitor_id(tnt_id)
- tnt_id_from_delivery_response(resp)
- offers_from_execute_response(resp)
- clear_settings_and_target_client_caches()
- api_exception_body_text(exc)

[Dependencies]
=========
- 표준 라이브러리 uuid
- adobe_backend.target_backend.target_config.get_adobe_target_settings
- adobe_backend.target_backend.target_client.get_target_client
- delivery_api_client.VisitorId
- delivery_api_client.exceptions.ApiException
"""

from __future__ import annotations

import uuid
from typing import Any, Optional

from delivery_api_client import VisitorId
from delivery_api_client.exceptions import ApiException

from adobe_backend.target_backend.target_client import get_target_client
from adobe_backend.target_backend.target_config import get_adobe_target_settings

TARGET_GLOBAL_MBOX_NAME = "target-global-mbox"
DEFAULT_TARGET_PAGE_LOAD_URL = "http://127.0.0.1/"
_DEFAULT_TNT_CLUSTER_HINT = "28_0"


# 1. [판별] 글로벌 mbox 이름인지 확인한다.
def is_target_global_mbox(mbox_name: str) -> bool:
    return (mbox_name or "").strip().lower() == TARGET_GLOBAL_MBOX_NAME


# 2. [방문자] 익명 호출용 클라이언트 tnt_id를 만든다.
def _new_client_tnt_id() -> str:
    return f"{uuid.uuid4().hex}.{_DEFAULT_TNT_CLUSTER_HINT}"


# 3. [방문자] 요청 문자열로 VisitorId 모델을 구성한다.
def build_delivery_visitor_id(tnt_id: Optional[str]) -> tuple[VisitorId, Optional[str]]:
    t = (tnt_id or "").strip()
    if t:
        return VisitorId(tnt_id=t), t
    generated = _new_client_tnt_id()
    return VisitorId(tnt_id=generated), generated


# 4. [응답] Delivery 응답의 id.tnt_id를 추출한다.
def tnt_id_from_delivery_response(resp: Any) -> Optional[str]:
    rid = getattr(resp, "id", None)
    if rid is None:
        return None
    t = getattr(rid, "tnt_id", None)
    if isinstance(t, str) and t.strip():
        return t.strip()
    return None


# 5. [오퍼] ExecuteResponse의 pageLoad/mboxes 옵션을 평탄 목록으로 만든다.
def offers_from_execute_response(resp: Any) -> list[dict[str, Any]]:
    offers: list[dict[str, Any]] = []
    if not hasattr(resp, "execute") or not resp.execute:
        return offers
    ex = resp.execute
    page_load = getattr(ex, "page_load", None)
    if page_load is not None and getattr(page_load, "options", None):
        for option in page_load.options or []:
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


# 6. [캐시] 설정/SDK 싱글톤 캐시를 비워 다음 요청에서 재로드되게 한다.
def clear_settings_and_target_client_caches() -> None:
    get_adobe_target_settings.cache_clear()
    get_target_client.cache_clear()


# 7. [예외] ApiException body를 사람이 읽을 수 있는 문자열로 만든다.
def api_exception_body_text(exc: ApiException) -> str:
    raw = exc.body
    if raw is None:
        return str(exc)
    if isinstance(raw, (bytes, bytearray)):
        return bytes(raw).decode("utf-8", errors="replace")
    return str(raw)
