"""Target Python SDK 싱글톤·property_token. 설정은 target_config.get_adobe_target_settings()."""

from __future__ import annotations

import logging
from functools import lru_cache

from target_python_sdk import TargetClient as AdobeTargetClient

from adobe_backend.target_backend.target_config import get_adobe_target_settings

logger = logging.getLogger(__name__)


@lru_cache(maxsize=1)
def get_target_client() -> AdobeTargetClient:
    cfg = get_adobe_target_settings()
    client_options = {
        "client": cfg.client,
        "organization_id": cfg.organization_id,
        "timeout": cfg.timeout,
    }
    client = AdobeTargetClient.create(client_options)
    logger.info("Adobe Target SDK initialized for client=%s", cfg.client)
    return client


def get_property_token() -> str:
    return get_adobe_target_settings().property_token
