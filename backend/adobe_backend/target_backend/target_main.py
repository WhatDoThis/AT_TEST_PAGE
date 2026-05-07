"""
adobe_backend.target_backend.target_main (Adobe Target 라우터 등록)
================================================================================
FastAPI 앱에 Target 프록시 라우터를 마운트한다.

[Main Functions]
===========
- register_target_routes: `/api` 접두사로 target_adobe_router 등록

[Endpoints/Classes/Functions]
=======================
- register_target_routes(app)

[Dependencies]
=========
- fastapi.FastAPI
- adobe_backend.target_backend.target_adobe_router
"""

from __future__ import annotations

from fastapi import FastAPI

from adobe_backend.target_backend.target_adobe_router import router as target_router


# 1. [라우터] FastAPI 앱에 Target API 라우터를 붙인다.
def register_target_routes(app: FastAPI) -> None:
    app.include_router(target_router, prefix="/api", tags=["adobe-target"])
