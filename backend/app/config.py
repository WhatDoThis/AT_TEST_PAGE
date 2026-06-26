"""
backend.app.config (JSON 기반 설정 로드)
================================================================================
APP_ENV(dev|prd)에 따라 backend/env/config.{APP_ENV}.json을 읽고 DB·API 메타를 제공한다.

[Main Functions]
===========
- _config_path: backend/env/config.{APP_ENV}.json 절대 경로
- _parse_db_block: dict 블록을 DbSettings로 변환(없으면 None)
- load_app_config: JSON 파일 경로 결합·파싱(파일/JSON 오류 시 RuntimeError)
- get_settings: 지연 로드된 Settings 싱글톤

[Endpoints/Classes/Functions]
=======================
- DbSettings: host, port, name, user, password
- Settings: raw, db(추천 테스트), telecom_db(통신사 테스트, 선택)

[Dependencies]
=========
- 표준 라이브러리 json, os
"""

from __future__ import annotations

import json
import os
from dataclasses import dataclass
from functools import lru_cache
from typing import Any, Mapping, Optional


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
    telecom_db: Optional[DbSettings] = None


# 1. [파싱] db/telecom_db 같은 단일 DB 블록을 DbSettings로 변환한다(빈 블록이면 None).
def _parse_db_block(block: Any) -> Optional[DbSettings]:
    if not isinstance(block, Mapping) or not block:
        return None
    return DbSettings(
        host=str(block.get("host", "127.0.0.1")),
        port=int(block.get("port", 5432)),
        name=str(block.get("name", "")),
        user=str(block.get("user", "")),
        password=str(block.get("password", "")),
    )


def load_app_config() -> Settings:
    path = _config_path()
    try:
        with open(path, encoding="utf-8") as f:
            raw: dict[str, Any] = json.load(f)
    except OSError as exc:
        raise RuntimeError(f"config_file_unreadable path={path}") from exc
    except json.JSONDecodeError as exc:
        raise RuntimeError(f"config_json_invalid path={path}") from exc
    db = _parse_db_block(raw.get("db")) or DbSettings(
        host="127.0.0.1", port=5432, name="", user="", password=""
    )
    telecom_db = _parse_db_block(raw.get("telecom_db"))
    return Settings(raw=raw, db=db, telecom_db=telecom_db)


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return load_app_config()
