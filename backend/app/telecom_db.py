"""
backend.app.telecom_db (통신사 테스트 DB 비동기 엔진·세션·ORM 매핑)
================================================================================
config의 telecom_db 정보로 lgu_target_test(별도 DB)에 asyncpg 엔진을 만들고
회선 그레인 테이블 telecom_test_lines를 조회 전용으로 매핑한다. 추천 테스트용
database.py(ibank_test_data)와 엔진/세션을 분리해 두 DB를 동시에 사용한다.

[Main Functions]
===========
- get_telecom_engine: 통신사 DB 비동기 엔진 생성·캐시
- get_telecom_session_factory: AsyncSession 팩토리
- get_telecom_db: FastAPI 의존성용 세션 제너레이터
- select_telecom_lines: 정렬된 회선 목록 Select
- select_telecom_line: line_id 단건 Select
- dispose_telecom_engine: 앱 종료 시 연결 정리

[Endpoints/Classes/Functions]
=======================
- TelecomTestLine: telecom_test_lines 매핑(조회 전용)
- get_telecom_db: 세션 의존성

[Dependencies]
=========
- sqlalchemy[asyncio], asyncpg
- app.config.get_settings
"""

from __future__ import annotations

from collections.abc import AsyncGenerator
from datetime import date, datetime
from urllib.parse import quote_plus

from sqlalchemy import Date, DateTime, Integer, String, select
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

from app.config import get_settings


class TelecomBase(DeclarativeBase):
    pass


# 1. [ORM] CREATE TABLE 없이 기존 telecom_test_lines(회선 그레인)만 매핑한다.
class TelecomTestLine(TelecomBase):
    __tablename__ = "telecom_test_lines"

    line_id: Mapped[str] = mapped_column(String(12), primary_key=True)
    customer_id: Mapped[str] = mapped_column(String(12))
    customer_name: Mapped[str] = mapped_column(String(20))
    customer_grade: Mapped[str] = mapped_column(String(8))
    bundle_yn: Mapped[str] = mapped_column(String(1))
    phone_no: Mapped[str] = mapped_column(String(13))
    plan_name: Mapped[str] = mapped_column(String(40))
    network_type: Mapped[str] = mapped_column(String(4))
    monthly_fee: Mapped[int] = mapped_column(Integer)
    contract_type: Mapped[str] = mapped_column(String(10))
    contract_end_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    device_model: Mapped[str] = mapped_column(String(40))
    device_purchase_date: Mapped[date] = mapped_column(Date)
    data_usage_pct: Mapped[int] = mapped_column(Integer)
    age_group: Mapped[str] = mapped_column(String(8))
    join_date: Mapped[date] = mapped_column(Date)
    churn_risk: Mapped[str] = mapped_column(String(4))
    marketing_consent_yn: Mapped[str] = mapped_column(String(1))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=False))


_telecom_engine: AsyncEngine | None = None
_telecom_session_factory: async_sessionmaker[AsyncSession] | None = None


# 2. [URL] telecom_db 미설정 시 명확한 오류, 특수문자 비밀번호는 이스케이프한다.
def _telecom_database_url() -> str:
    s = get_settings().telecom_db
    if s is None:
        raise RuntimeError("telecom_db_not_configured: config의 telecom_db 블록이 없습니다.")
    user = quote_plus(s.user)
    password = quote_plus(s.password) if s.password else ""
    auth = f"{user}:{password}" if password else user
    return f"postgresql+asyncpg://{auth}@{s.host}:{s.port}/{s.name}"


def get_telecom_engine() -> AsyncEngine:
    global _telecom_engine
    if _telecom_engine is None:
        _telecom_engine = create_async_engine(
            _telecom_database_url(),
            pool_pre_ping=True,
            echo=False,
        )
    return _telecom_engine


def get_telecom_session_factory() -> async_sessionmaker[AsyncSession]:
    global _telecom_session_factory
    if _telecom_session_factory is None:
        _telecom_session_factory = async_sessionmaker(
            get_telecom_engine(),
            expire_on_commit=False,
        )
    return _telecom_session_factory


async def get_telecom_db() -> AsyncGenerator[AsyncSession, None]:
    factory = get_telecom_session_factory()
    async with factory() as session:
        yield session


# 3. [쿼리] 회선 목록을 line_id 오름차순으로 정렬해 반환한다(필터는 호출부에서 추가).
def select_telecom_lines():
    return select(TelecomTestLine).order_by(TelecomTestLine.line_id.asc())


# 4. [쿼리] line_id 단건 조회 Select.
def select_telecom_line(line_id: str):
    return select(TelecomTestLine).where(TelecomTestLine.line_id == line_id)


# 5. [정리] 앱 종료 시 통신사 DB 엔진·세션 팩토리를 해제한다.
async def dispose_telecom_engine() -> None:
    global _telecom_engine, _telecom_session_factory
    if _telecom_engine is not None:
        await _telecom_engine.dispose()
    _telecom_engine = None
    _telecom_session_factory = None
