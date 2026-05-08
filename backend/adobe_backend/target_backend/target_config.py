"""
adobe_backend.target_backend.target_config (Adobe Target 전용 JSON 설정)
================================================================================
런타임은 **`backend/env/config.adobe.json`** 을 읽는다(저장소 미추적). 템플릿은
**`backend/env/config.adobe.example.json`** 을 복사해 채운다.
지원 형식: (1) 루트 평면 키 client·organization_id·… (2) administration / mboxes 중첩 블록.
ASCII 검증은 target_client 에서 수행한다.

[Main Functions]
===========
- _adobe_config_path: backend/env/config.adobe.json 절대 경로(없으면 example 복사 안내)
- _adobe_target_str: JSON 문자열 필드 strip 정규화
- _str_admin_or_root / _str_mboxes_or_root / _int_timeout_ms: 평면·중첩 JSON 모두에서 값 추출
- load_adobe_target_settings: adobe JSON 파싱 및 AdobeTargetSettings 반환
- get_adobe_target_settings: Adobe 설정 싱글톤 캐시 반환

[Endpoints/Classes/Functions]
=======================
- AdobeTargetSettings: client, organization_id, property_token, timeout, offer_mbox_name
- _str_admin_or_root, _str_mboxes_or_root, _int_timeout_ms: JSON 키 해석(평면·중첩)

[Dependencies]
=========
- 표준 라이브러리 json, pathlib, functools
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import Any


def _adobe_config_path() -> Path:
    """Adobe 공통 설정 파일 경로(APP_ENV 무관). Git에는 `config.adobe.example.json` 만 있다."""
    backend_root = Path(__file__).resolve().parents[2]
    return backend_root / "env" / "config.adobe.json"


def _adobe_target_str(value: Any) -> str:
    if value is None:
        return ""
    return str(value).strip()


# 1. [경로] administration.* 또는 루트 client·organization_id·property_token
def _str_admin_or_root(at_block: dict[str, Any], key: str) -> str:
    adm = at_block.get("administration")
    if isinstance(adm, dict) and key in adm and adm.get(key) is not None:
        return _adobe_target_str(adm.get(key))
    return _adobe_target_str(at_block.get(key, ""))


# 2. [경로] mboxes.* 또는 루트 offer_mbox_name
def _str_mboxes_or_root(at_block: dict[str, Any], key: str) -> str:
    mb = at_block.get("mboxes")
    if isinstance(mb, dict) and key in mb and mb.get(key) is not None:
        return _adobe_target_str(mb.get(key))
    return _adobe_target_str(at_block.get(key, ""))


# 3. [경로] administration.timeout 또는 루트 timeout
def _int_timeout_ms(at_block: dict[str, Any]) -> int:
    adm = at_block.get("administration")
    if isinstance(adm, dict) and adm.get("timeout") is not None:
        return int(adm.get("timeout", 3000))
    return int(at_block.get("timeout", 3000))


@dataclass(frozen=True)
class AdobeTargetSettings:
    client: str
    organization_id: str
    property_token: str
    timeout: int
    offer_mbox_name: str


# 4. [로드] backend/env/config.adobe.json 에서 Adobe Target 설정을 읽는다.
def load_adobe_target_settings() -> AdobeTargetSettings:
    path = _adobe_config_path()
    example = path.with_name("config.adobe.example.json")
    try:
        with path.open(encoding="utf-8") as f:
            at_block: dict[str, Any] = json.load(f)
    except OSError as exc:
        raise RuntimeError(
            "adobe_config_unreadable path="
            f"{path} — create it from {example.name} (copy to config.adobe.json and fill values)"
        ) from exc
    except json.JSONDecodeError as exc:
        raise RuntimeError(
            "adobe_config_json_invalid path="
            f"{path} — fix JSON or recreate from {example.name}"
        ) from exc

    offer_m = _str_mboxes_or_root(at_block, "offer_mbox_name")
    return AdobeTargetSettings(
        client=_str_admin_or_root(at_block, "client"),
        organization_id=_str_admin_or_root(at_block, "organization_id"),
        property_token=_str_admin_or_root(at_block, "property_token"),
        timeout=_int_timeout_ms(at_block),
        offer_mbox_name=offer_m or "target-global-mbox",
    )


# 5. [캐시] Adobe Target 설정 싱글톤(필요 시 cache_clear로 재로드)
@lru_cache(maxsize=1)
def get_adobe_target_settings() -> AdobeTargetSettings:
    return load_adobe_target_settings()
