"""
backend.app.database (비동기 SQLAlchemy 엔진·세션·ORM 매핑)
================================================================================
config의 DB 정보로 asyncpg 드라이버 엔진을 만들고 test_coupons_data 테이블을 매핑한다.

[Main Functions]
===========
- get_engine: 비동기 엔진 생성·캐시
- get_session_factory: AsyncSession 팩토리
- get_db: FastAPI 의존성용 세션 제너레이터
- select_coupon_rows: 모듈 레벨 base SELECT(정렬 created DESC, id DESC) 참조 반환

[Endpoints/Classes/Functions]
=======================
- TestCouponsData: 기존 테이블 매핑(조회 전용, 시각 컬럼은 NOT NULL 명시)
- dispose_engine: 앱 종료 시 연결 정리

[Dependencies]
=========
- sqlalchemy[asyncio], asyncpg
- app.config.get_settings
"""

from __future__ import annotations

from collections.abc import AsyncGenerator
from datetime import datetime
from urllib.parse import quote_plus

from sqlalchemy import BigInteger, DateTime, String, select
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

from app.config import get_settings


class Base(DeclarativeBase):
    pass


# 1. [ORM] CREATE TABLE 없이 기존 test_coupons_data만 매핑한다.
class TestCouponsData(Base):
    __tablename__ = "test_coupons_data"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    campaign_id: Mapped[int] = mapped_column(BigInteger)
    campaign_internal_name: Mapped[str] = mapped_column(String(64))
    campaign_label: Mapped[str] = mapped_column(String(255))
    workflow_id: Mapped[int] = mapped_column(BigInteger)
    workflow_internal_name: Mapped[str] = mapped_column(String(64))
    workflow_label: Mapped[str] = mapped_column(String(255))
    recipient_id: Mapped[str] = mapped_column(String(12))
    created: Mapped[datetime] = mapped_column(DateTime(timezone=False), nullable=False)
    last_modified: Mapped[datetime] = mapped_column(
        DateTime(timezone=False), nullable=False
    )
    coupon_id: Mapped[str] = mapped_column(String(40))
    coupon_date: Mapped[datetime] = mapped_column(DateTime(timezone=False), nullable=False)


_engine: AsyncEngine | None = None
_session_factory: async_sessionmaker[AsyncSession] | None = None


# 2. [URL] 특수문자 비밀번호를 안전하게 이스케이프한다.
def _database_url() -> str:
    s = get_settings().db
    user = quote_plus(s.user)
    password = quote_plus(s.password) if s.password else ""
    auth = f"{user}:{password}" if password else user
    return f"postgresql+asyncpg://{auth}@{s.host}:{s.port}/{s.name}"


def get_engine() -> AsyncEngine:
    global _engine
    if _engine is None:
        _engine = create_async_engine(
            _database_url(),
            pool_pre_ping=True,
            echo=False,
        )
    return _engine


def get_session_factory() -> async_sessionmaker[AsyncSession]:
    global _session_factory
    if _session_factory is None:
        _session_factory = async_sessionmaker(
            get_engine(),
            expire_on_commit=False,
        )
    return _session_factory


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    factory = get_session_factory()
    async with factory() as session:
        yield session


async def dispose_engine() -> None:
    global _engine, _session_factory
    if _engine is not None:
        await _engine.dispose()
    _engine = None
    _session_factory = None


# 3. [쿼리] immutable base — offset/limit은 호출부에서 매번 새 Select로 이어 붙인다.
_BASE_COUPON_SELECT = (
    select(
        TestCouponsData.id,
        TestCouponsData.created,
        TestCouponsData.campaign_label,
        TestCouponsData.workflow_label,
        TestCouponsData.coupon_id,
    ).order_by(TestCouponsData.created.desc(), TestCouponsData.id.desc())
)


def select_coupon_rows():
    return _BASE_COUPON_SELECT
