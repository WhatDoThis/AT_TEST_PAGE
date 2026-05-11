"""FastAPI에 Adobe Target 라우터를 등록한다."""

from __future__ import annotations

from fastapi import FastAPI

from adobe_backend.target_backend.target_adobe_router import router as target_router


def register_target_routes(app: FastAPI) -> None:
    app.include_router(target_router, prefix="/api", tags=["adobe-target"])
