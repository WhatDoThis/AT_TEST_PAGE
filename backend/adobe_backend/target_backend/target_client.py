"""
adobe_backend.target_backend.target_client (Adobe Target Python SDK 클라이언트)
================================================================================
Adobe Target Python SDK를 초기화하고 싱글톤으로 제공한다.
get_offers, send_notifications 등 Target 서버측 기능의 진입점이다.

[Main Functions]
===========
- get_target_client: Adobe Target SDK 클라이언트 싱글톤 반환
- get_property_token: 설정의 property token 조회
- _assert_adobe_target_ascii: client 등이 ASCII인지 검사(한글 플레이스홀더 시 urllib3 파싱 오류 방지)

[Endpoints/Classes/Functions]
=======================
- get_target_client()
- get_property_token()
- AdobeTargetConfigError

[Dependencies]
=========
- target-python-sdk
- app.config.get_settings
"""

# ════════════════════════════════════════════════════════════════════════════════
# ████████  ADOBE TARGET 전용 파일 — 전체 코드가 Adobe Target 연동용  ████████
# ════════════════════════════════════════════════════════════════════════════════

from __future__ import annotations

import logging
from functools import lru_cache

from target_python_sdk import TargetClient as AdobeTargetClient

from app.config import get_settings

logger = logging.getLogger(__name__)


class AdobeTargetConfigError(ValueError):
    """adobe_target 값이 비ASCII이거나 비어 있어 Target delivery URL을 만들 수 없을 때."""


# 1. [검증] client·organization_id·property_token ASCII 검사
def _assert_adobe_target_ascii(client: str, organization_id: str, property_token: str) -> None:
    for label, value in (
        ("client", client),
        ("organization_id", organization_id),
        ("property_token", property_token),
    ):
        if not value or not value.strip():
            raise AdobeTargetConfigError(
                f"adobe_target.{label} is empty; set `backend/env/config.adobe.json`"
            )
        try:
            value.encode("ascii")
        except UnicodeEncodeError as exc:
            raise AdobeTargetConfigError(
                f"adobe_target.{label} must be ASCII only (Korean placeholder breaks urllib3 host parse). "
                f"Replace with real Target {label} from Adobe admin (`backend/env/config.adobe.json`)."
            ) from exc


# 2. [SDK] Target Python SDK 클라이언트 싱글톤
@lru_cache(maxsize=1)
def get_target_client() -> AdobeTargetClient:
    cfg = get_settings().adobe_target
    _assert_adobe_target_ascii(cfg.client, cfg.organization_id, cfg.property_token)
    client_options = {
        "client": cfg.client,
        "organization_id": cfg.organization_id,
        "timeout": cfg.timeout,
    }
    client = AdobeTargetClient.create(client_options)
    logger.info("Adobe Target SDK initialized for client=%s", cfg.client)
    return client


# 3. [토큰] Delivery API property token
def get_property_token() -> str:
    return get_settings().adobe_target.property_token
