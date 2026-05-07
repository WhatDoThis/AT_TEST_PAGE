"""
backend.app.config (JSON 기반 설정 로드)
================================================================================
APP_ENV(dev|prd)에 따라 backend/env/config.{APP_ENV}.json을 읽고 DB·API 메타를 제공한다.
※ Adobe Target 전용 설정은 **앱 패키지 밖** `adobe_backend/target_backend/target_config.py` 가
  **`backend/env/config.adobe.json`**(로컬 전용, Git 미추적·`config.adobe.example.json` 복사) 을 읽어 구성하며, 본 파일에서는 아래 [BRIDGE · Adobe] 구역의
  임포트·`load_adobe_target_settings()` 호출·`Settings.adobe_target` 타입만 연결한다.

[Main Functions]
===========
- _config_path: backend/env/config.{APP_ENV}.json 절대 경로
- load_app_config: JSON 파일 경로 결합·파싱(파일/JSON 오류 시 RuntimeError)
- get_settings: 지연 로드된 Settings 싱글톤

[Endpoints/Classes/Functions]
=======================
- DbSettings: host, port, name, user, password
- Settings: raw, db, adobe_target (타입은 target_config.AdobeTargetSettings)

[Dependencies]
=========
- 표준 라이브러리 json, os
- adobe_backend.target_backend.target_config (load_adobe_target_settings, AdobeTargetSettings)
"""

from __future__ import annotations

import json
import os
from dataclasses import dataclass
from functools import lru_cache
from typing import Any, Mapping

# ════════════════════════════════════════════════════════════════════════════════
# [BRIDGE · Adobe] 구분선 — 위: 앱 코어(stdlib·앱 전용) / 아래: 어도비 패키지 의존
# ── 위치: backend/adobe_backend/target_backend/target_config.py
# ── 목적: `backend/env/config.adobe.json`(example 복사) → AdobeTargetSettings / load_adobe_target_settings()
# ── 사용처: Settings.adobe_target 타입, load_app_config() 내 AT 설정 병합
# ════════════════════════════════════════════════════════════════════════════════
from adobe_backend.target_backend.target_config import (
    AdobeTargetSettings,
    load_adobe_target_settings,
)
# ════════════════════════════════════════════════════════════════════════════════
# [BRIDGE · Adobe] 끝 — 이하 다시 앱 코어(일반 Settings·DB 로드)
# ════════════════════════════════════════════════════════════════════════════════


def _config_path() -> str:
    env = os.getenv("APP_ENV", "dev")
    base = os.path.dirname(__file__)
    return os.path.normpath(os.path.join(base, "..", "env", f"config.{env}.json"))


@dataclass(frozen=True)
class DbSettings:
    host: str
    port: int
    name: str
    user: str
    password: str


@dataclass(frozen=True)
class Settings:
    raw: Mapping[str, Any]
    db: DbSettings
    # ── [BRIDGE · Adobe] 필드 — 타입 출처: adobe_backend.target_backend.target_config.AdobeTargetSettings
    adobe_target: AdobeTargetSettings


def load_app_config() -> Settings:
    path = _config_path()
    try:
        with open(path, encoding="utf-8") as f:
            raw: dict[str, Any] = json.load(f)
    except OSError as exc:
        raise RuntimeError(f"config_file_unreadable path={path}") from exc
    except json.JSONDecodeError as exc:
        raise RuntimeError(f"config_json_invalid path={path}") from exc
    db_block = raw.get("db") or {}
    db = DbSettings(
        host=str(db_block.get("host", "127.0.0.1")),
        port=int(db_block.get("port", 5432)),
        name=str(db_block.get("name", "")),
        user=str(db_block.get("user", "")),
        password=str(db_block.get("password", "")),
    )
    # ── [BRIDGE · Adobe] 어도비 패키지 함수 — 파일: backend/env/config.adobe.json (템플릿: config.adobe.example.json)
    adobe_target = load_adobe_target_settings()
    return Settings(raw=raw, db=db, adobe_target=adobe_target)


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return load_app_config()
