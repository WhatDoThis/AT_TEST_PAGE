"""
adobe_backend_example.client_python_sdk (Adobe Target Python SDK 초기화 예시)
================================================================================
Web(서버사이드) Adobe Target SDK 를 쓰기 위한 **최소 초기화 코드**.
설정값(자격 코드·조직 ID·Property 토큰·타임아웃)을 모아 TargetClient 를 1회 생성한다.

핵심 한 줄: `TargetClient.create({...})` 한 번으로 SDK 클라이언트가 준비된다.

[설치] (이미 설치되어 있다면 생략 — 참고용)
===========
# pip install "target-python-sdk>=1.1.0,<2"
#   └ delivery-api-client(Adobe Delivery 객체)도 함께 설치된다.

[Main Functions]
===========
- get_target_client: TargetClient 싱글톤 생성·반환(초기화)
- get_property_token: at_property 토큰 반환(Delivery 요청에 주입)

[Endpoints/Classes/Functions]
=======================
- AdobeTargetSettings: client, organization_id, property_token, timeout (mbox 이름은 요청 시 인자로 전달)
- get_target_client() -> TargetClient
- get_property_token() -> str

[Dependencies]
=========
- target_python_sdk (TargetClient)
- functools.lru_cache, dataclasses (표준 라이브러리)
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from functools import lru_cache

# Adobe 가 제공하는 서버사이드 SDK. 설치되어 있어야 한다(상단 [설치] 주석 참고).
from target_python_sdk import TargetClient

logger = logging.getLogger(__name__)


# ──────────────────────────────────────────────────────────────────────────────
# 1. [설정] SDK 자격값. 실제 시스템에서는 이 값들을 환경변수/설정파일에서 읽어 채운다.
#    (예: backend/env/config.adobe.json 의 administration 블록)
#    - client          : Adobe Target 클라이언트 코드(테넌트)
#    - organization_id : Experience Cloud 조직 ID("...@AdobeOrg")
#    - property_token  : at_property 토큰(활동을 특정 Property 로 구획한 경우)
#    - timeout         : Delivery 요청 타임아웃(ms)
#    ※ mbox(location) 이름은 초기화에 불필요하다 — 요청 시점 값이므로 호출 인자로 전달한다
#      (delivery_python_sdk.get_offers_example(mbox_name, ...) 참고).
# ──────────────────────────────────────────────────────────────────────────────
@dataclass(frozen=True)
class AdobeTargetSettings:
    client: str            # SDK 초기화 필수
    organization_id: str   # SDK 초기화 필수
    property_token: str    # 요청 시 _property 에 주입(초기화 자체엔 불필요, 활동 구획용)
    timeout: int           # SDK 초기화 옵션


# 예시 기본값(반드시 본인 환경값으로 교체). ASCII 만 사용해야 한다.
EXAMPLE_SETTINGS = AdobeTargetSettings(
    client="your_adobe_client_code",
    organization_id="your_org_id@AdobeOrg",
    property_token="00000000-0000-0000-0000-000000000000",
    timeout=3000,
)


# 2. SDK 클라이언트 생성(초기화) — 무거운 객체라 lru_cache 로 1회만 만든다(싱글톤).
@lru_cache(maxsize=1)
def get_target_client() -> TargetClient:
    cfg = EXAMPLE_SETTINGS
    # 초기화의 전부. organization_id 와 client 가 필수.
    client = TargetClient.create(
        {
            "client": cfg.client,
            "organization_id": cfg.organization_id,
            "timeout": cfg.timeout,
        }
    )
    logger.info("Adobe Target SDK initialized: client=%s", cfg.client)
    return client


# 3. Property 토큰 — Delivery 요청의 `_property`(ModelProperty)에 주입해 특정 Property 활동만 평가시킨다.
def get_property_token() -> str:
    return EXAMPLE_SETTINGS.property_token
