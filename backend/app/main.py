"""
backend.app.main (FastAPI 애플리케이션 진입점)
================================================================================
CORS·라우터·수명 주기를 구성하고 uvicorn에서 app 객체로 노출한다.

※ Adobe Target HTTP 라우터는 **앱 패키지 밖** `adobe_backend/target_backend/target_main.py` 의
  `register_target_routes(app)` 으로만 마운트한다. 본 파일에서는 [BRIDGE · Adobe] 주석 블록으로
  앱 코어(import coupons·lifespan)와 구분한다.

[Main Functions]
===========
- FastAPI 인스턴스 생성 및 미들웨어(CORS, dev 시 localhost Origin 정규식, Private Network Access preflight) 설정
- lifespan에서 DB 엔진 정리

[Endpoints/Classes/Functions]
=======================
- app: FastAPI 애플리케이션
- (AT) adobe_backend.target_backend.target_main.register_target_routes

[Dependencies]
=========
- fastapi, uvicorn(실행기)
- app.routers.coupons, app.database.dispose_engine
- adobe_backend.target_backend.target_main (register_target_routes만 사용)
"""

from __future__ import annotations

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import dispose_engine
from app.routers import coupons

# ════════════════════════════════════════════════════════════════════════════════
# [BRIDGE · Adobe] 구분선 — 위: 앱 코어 라우터·DB / 아래: 어도비 패키지 진입만 임포트
# ── 위치: backend/adobe_backend/target_backend/target_main.py
# ── 심볼: target_main (별칭 _adobe_target_main) → register_target_routes
# ── 효과: `POST /api/target/offers`, `POST /api/target/profile-test`, `POST /api/target/recommendation-test` 가 prefix `/api` 로 마운트됨
# ════════════════════════════════════════════════════════════════════════════════
from adobe_backend.target_backend import target_main as _adobe_target_main
# ════════════════════════════════════════════════════════════════════════════════
# [BRIDGE · Adobe] 임포트 끝
# ════════════════════════════════════════════════════════════════════════════════


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    await dispose_engine()


app = FastAPI(title="AT_TEST_PAGE API", lifespan=lifespan)
settings = get_settings()
_raw_cors = settings.raw.get("cors_origins") or []
if isinstance(_raw_cors, str):
    cors_origins = [_raw_cors.strip().rstrip("/")] if _raw_cors.strip() else []
else:
    cors_origins = [str(x).strip().rstrip("/") for x in _raw_cors if str(x).strip()]

_cors_kw: dict = {
    "allow_origins": cors_origins,
    "allow_methods": ["GET", "POST", "OPTIONS"],
    "allow_headers": ["*"],
    "allow_private_network": True,
}
# APP_ENV=dev 일 때 Expo 웹 등 localhost·127.0.0.1·[::1] 임의 포트를 허용한다.
# (config JSON만 수정했는데 uvicorn이 .json 변경으로 재기동하지 않으면 캐시된 빈 CORS가 남을 수 있음)
if os.getenv("APP_ENV", "dev") == "dev":
    _cors_kw["allow_origin_regex"] = r"^https?://(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$"

app.add_middleware(CORSMiddleware, **_cors_kw)

app.include_router(coupons.router, prefix="/api", tags=["coupons"])

# ════════════════════════════════════════════════════════════════════════════════
# [BRIDGE · Adobe] 라우터 마운트 — 앱 코어(coupons)와 별도로 어도비 패키지에 위임
# ── 호출: adobe_backend.target_backend.target_main.register_target_routes(app)
# ── 대상: target_adobe_router 의 prefix=/api (태그 adobe-target)
# ════════════════════════════════════════════════════════════════════════════════
_adobe_target_main.register_target_routes(app)
# ════════════════════════════════════════════════════════════════════════════════
# [BRIDGE · Adobe] 라우터 마운트 끝
# ════════════════════════════════════════════════════════════════════════════════
