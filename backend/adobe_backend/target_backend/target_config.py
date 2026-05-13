"""Adobe Target 설정 로드 (backend/env/config.adobe.json)
================================================================================
`administration`·`mboxes` 블록에서 자격·타임아웃·mbox 이름을 읽어 `AdobeTargetSettings` 로 반환한다.

[Main Functions]
===========
- get_adobe_target_settings: 캐시된 설정 싱글톤
- _load: JSON 파일 파싱 및 검증

[Endpoints/Classes/Functions]
=======================
- AdobeTargetSettings: client, organization_id, property_token, timeout, offer_mbox_name, recs_mbox_name
- AdobeTargetConfigError

[Dependencies]
=========
- pathlib, json, functools.lru_cache
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import Any


class AdobeTargetConfigError(ValueError):
    """필수 설정값 누락 또는 비ASCII."""


@dataclass(frozen=True)
class AdobeTargetSettings:
    client: str
    organization_id: str
    property_token: str
    timeout: int
    offer_mbox_name: str
    recs_mbox_name: str


def _config_path() -> Path:
    return Path(__file__).resolve().parents[2] / "env" / "config.adobe.json"


def _str(block: dict[str, Any], key: str, *subs: str) -> str:
    for s in subs:
        sub = block.get(s)
        if isinstance(sub, dict) and key in sub and sub[key] is not None:
            return str(sub[key]).strip()
    val = block.get(key)
    return str(val).strip() if val is not None else ""


def _int(block: dict[str, Any], key: str, default: int, *subs: str) -> int:
    val = _str(block, key, *subs)
    return int(val) if val else default


def _assert_ascii(settings: AdobeTargetSettings) -> None:
    for label in ("client", "organization_id", "property_token"):
        value = getattr(settings, label)
        if not value:
            raise AdobeTargetConfigError(f"adobe_target.{label} is empty")
        try:
            value.encode("ascii")
        except UnicodeEncodeError as exc:
            raise AdobeTargetConfigError(
                f"adobe_target.{label} must be ASCII only"
            ) from exc


def _load() -> AdobeTargetSettings:
    path = _config_path()
    try:
        with path.open(encoding="utf-8") as f:
            raw: dict[str, Any] = json.load(f)
    except OSError as exc:
        raise RuntimeError(f"config unreadable: {path}") from exc
    except json.JSONDecodeError as exc:
        raise RuntimeError(f"config invalid JSON: {path}") from exc

    s = AdobeTargetSettings(
        client=_str(raw, "client", "administration"),
        organization_id=_str(raw, "organization_id", "administration"),
        property_token=_str(raw, "property_token", "administration"),
        timeout=_int(raw, "timeout", 3000, "administration"),
        offer_mbox_name=_str(raw, "offer_mbox_name", "mboxes") or "target-global-mbox",
        recs_mbox_name=_str(raw, "recs_mbox_name", "mboxes") or "target-recs-mbox",
    )
    _assert_ascii(s)
    return s


@lru_cache(maxsize=1)
def get_adobe_target_settings() -> AdobeTargetSettings:
    return _load()
