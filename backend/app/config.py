"""
backend.app.config (JSON 기반 설정 로드)
================================================================================
APP_ENV(dev|prd)에 따라 backend/env/config.{APP_ENV}.json을 읽고 DB·API 메타를 제공한다.

[Main Functions]
===========
- _config_path: backend/env/config.{APP_ENV}.json 절대 경로
- load_app_config: JSON 파일 경로 결합·파싱(파일/JSON 오류 시 RuntimeError)
- get_settings: 지연 로드된 Settings 싱글톤

[Endpoints/Classes/Functions]
=======================
- DbSettings: host, port, name, user, password
- Settings: raw, db

[Dependencies]
=========
- 표준 라이브러리 json, os
"""

from __future__ import annotations

import json
import os
from dataclasses import dataclass
from functools import lru_cache
from typing import Any, Mapping


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
    return Settings(raw=raw, db=db)


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return load_app_config()
