"""
backend.app.database (비동기 SQLAlchemy 엔진·세션·ORM 매핑)
================================================================================
config의 DB 정보로 asyncpg 드라이버 엔진을 만들고 test_coupons_data 테이블을 매핑한다. 목록 API는 created 구간 필터 후 recipient_id당 최신 1행(ROW_NUMBER)만 노출한다.

[Main Functions]
===========
- get_engine: 비동기 엔진 생성·캐시
- get_session_factory: AsyncSession 팩토리
- get_db: FastAPI 의존성용 세션 제너레이터
- coupon_visible_created_filter: 목록·CSV 공통 created 구간 필터
- coupon_list_from_dedup: 수신자당 1행 부분집합(rank·outer Select) 반환
- select_coupon_rows: 수신자 중복 제거 후 created DESC, id DESC 정렬된 Select

[Endpoints/Classes/Functions]
=======================
- TestCouponsData: 기존 테이블 매핑(조회 전용, 시각 컬럼은 NOT NULL 명시)
- coupon_list_from_dedup: ROW_NUMBER 기반 수신자당 1행 outer Select
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

from sqlalchemy import BigInteger, DateTime, String, and_, func, select
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

from app.config import get_settings

# 목록·CSV에서 사용하는 created 반개구간 [COUPON_VISIBLE_CREATED_GTE, COUPON_VISIBLE_CREATED_LT)
COUPON_VISIBLE_CREATED_GTE = datetime(2026, 5, 1, 0, 0, 0)
COUPON_VISIBLE_CREATED_LT = datetime(2026, 5, 10, 0, 0, 0)


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


# 3. [필터] SQL 예시와 동일: created >= '2026-05-01' AND created < '2026-05-10'
def coupon_visible_created_filter():
    return and_(
        TestCouponsData.created >= COUPON_VISIBLE_CREATED_GTE,
        TestCouponsData.created < COUPON_VISIBLE_CREATED_LT,
    )


# 4. [정리] 앱 종료 시 엔진·세션 팩토리를 해제한다.
async def dispose_engine() -> None:
    global _engine, _session_factory
    if _engine is not None:
        await _engine.dispose()
    _engine = None
    _session_factory = None


# 5. [쿼리] 구간 내 행에 ROW_NUMBER를 매겨 recipient_id당 최신(created·id 내림차) 1행만 남긴다.
def _dedup_ranked_subquery():
    rn = (
        func.row_number()
        .over(
            partition_by=TestCouponsData.recipient_id,
            order_by=(TestCouponsData.created.desc(), TestCouponsData.id.desc()),
        )
        .label("rn")
    )
    return (
        select(
            TestCouponsData.id,
            TestCouponsData.created,
            TestCouponsData.recipient_id,
            TestCouponsData.campaign_label,
            TestCouponsData.workflow_label,
            rn,
        )
        .where(coupon_visible_created_filter())
    ).subquery("coupon_ranked")


def coupon_list_from_dedup():
    ranked = _dedup_ranked_subquery()
    outer = (
        select(
            ranked.c.id,
            ranked.c.created,
            ranked.c.recipient_id,
            ranked.c.campaign_label,
            ranked.c.workflow_label,
        )
        .select_from(ranked)
        .where(ranked.c.rn == 1)
    )
    return ranked, outer


def select_coupon_rows():
    ranked, outer = coupon_list_from_dedup()
    return outer.order_by(ranked.c.created.desc(), ranked.c.id.desc())
