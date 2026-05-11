"""backend/env/config.adobe.json 로드·검증 및 AdobeTargetSettings. 의존: json, pathlib, functools."""

from __future__ import annotations

import json
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import Any


class AdobeTargetConfigError(ValueError):
    """client·organization_id·property_token 이 비어 있거나 비ASCII일 때."""


def _adobe_config_path() -> Path:
    """backend/env/config.adobe.json 경로(APP_ENV 무관)."""
    backend_root = Path(__file__).resolve().parents[2]
    return backend_root / "env" / "config.adobe.json"


def _get_str(block: dict[str, Any], key: str, *sub_keys: str) -> str:
    """block[sub][key] 또는 block[key]에서 strip된 문자열."""
    for sk in sub_keys:
        sub = block.get(sk)
        if isinstance(sub, dict) and key in sub and sub[key] is not None:
            return str(sub[key]).strip()
    val = block.get(key)
    return str(val).strip() if val is not None else ""


def _get_int(block: dict[str, Any], key: str, default: int, *sub_keys: str) -> int:
    val = _get_str(block, key, *sub_keys)
    return int(val) if val else default


def _assert_adobe_target_ascii(client: str, organization_id: str, property_token: str) -> None:
    for label, value in (
        ("client", client),
        ("organization_id", organization_id),
        ("property_token", property_token),
    ):
        if not value or not value.strip():
            raise AdobeTargetConfigError(
                f"adobe_target.{label} is empty; set config.adobe.json"
            )
        try:
            value.encode("ascii")
        except UnicodeEncodeError as exc:
            raise AdobeTargetConfigError(
                f"adobe_target.{label} must be ASCII only (Korean placeholder breaks urllib3 host parse). "
                f"Replace with real Target {label} from Adobe admin (`backend/env/config.adobe.json`, template: config.adobe.example.json)."
            ) from exc


@dataclass(frozen=True)
class AdobeTargetSettings:
    client: str
    organization_id: str
    property_token: str
    timeout: int
    offer_mbox_name: str


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

    offer_m = _get_str(at_block, "offer_mbox_name", "mboxes")
    settings = AdobeTargetSettings(
        client=_get_str(at_block, "client", "administration"),
        organization_id=_get_str(at_block, "organization_id", "administration"),
        property_token=_get_str(at_block, "property_token", "administration"),
        timeout=_get_int(at_block, "timeout", 3000, "administration"),
        offer_mbox_name=offer_m or "target-global-mbox",
    )
    _assert_adobe_target_ascii(settings.client, settings.organization_id, settings.property_token)
    return settings


@lru_cache(maxsize=1)
def get_adobe_target_settings() -> AdobeTargetSettings:
    return load_adobe_target_settings()
