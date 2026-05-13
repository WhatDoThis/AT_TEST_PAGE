"""Adobe Target SDK 싱글톤 클라이언트."""

from __future__ import annotations

import logging
from functools import lru_cache

from target_python_sdk import TargetClient

from adobe_backend.target_backend.target_config import get_adobe_target_settings

logger = logging.getLogger(__name__)


@lru_cache(maxsize=1)
def get_target_client() -> TargetClient:
    cfg = get_adobe_target_settings()
    client = TargetClient.create({
        "client": cfg.client,
        "organization_id": cfg.organization_id,
        "timeout": cfg.timeout,
    })
    logger.info("Adobe Target SDK initialized: client=%s", cfg.client)
    return client


def get_property_token() -> str:
    return get_adobe_target_settings().property_token
