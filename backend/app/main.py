"""
backend.app.main (FastAPI 애플리케이션 진입점)
================================================================================
CORS·라우터·수명 주기를 구성하고 uvicorn에서 app 객체로 노출한다.

[Main Functions]
===========
- FastAPI 인스턴스 생성 및 미들웨어(CORS) 설정
- lifespan에서 DB 엔진 정리

[Endpoints/Classes/Functions]
=======================
- app: FastAPI 애플리케이션

[Dependencies]
=========
- fastapi, uvicorn(실행기)
- app.routers.coupons, app.database.dispose_engine
"""

from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import dispose_engine
from app.routers import coupons


# 1. [수명 주기] 종료 시 커넥션 풀을 정리한다.
@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    await dispose_engine()


app = FastAPI(title="AT_TEST_PAGE API", lifespan=lifespan)
settings = get_settings()
cors_origins = settings.raw.get("cors_origins", [])

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_methods=["GET"],
    allow_headers=["*"],
)

app.include_router(coupons.router, prefix="/api", tags=["coupons"])
