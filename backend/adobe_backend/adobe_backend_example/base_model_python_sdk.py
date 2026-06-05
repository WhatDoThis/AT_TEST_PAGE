"""
adobe_backend_example.base_model_python_sdk (Adobe Delivery 객체 빌더 예시)
================================================================================
Delivery 요청을 만들 때 쓰는 **Adobe 제공 객체(delivery_api_client)** 를 조립하는 빌더 모음.
"Adobe 객체를 담는 베이스 모델" 역할 — 화면/도메인 모델과 분리해 여기서만 SDK 객체를 만든다.

Delivery 요청 한 건의 구조(아래 빌더가 만드는 것):
    DeliveryRequest
      ├─ id        = VisitorId(tnt_id / third_party_id / customer_ids)   # 누구
      ├─ context   = Context(channel=WEB)                                # 채널
      ├─ execute   = ExecuteRequest(mboxes=[MboxRequest(...)])           # 무엇을(위치)
      └─ _property = ModelProperty(token=at_property)                    # 어느 Property

★ 통신사(텔코) 웹/앱 추천 구축 대비:
  - 하단 [TELECOM] 섹션에 "엔터티 속성·프로필 속성 템플릿"과 "조회/전환 신호 빌더"를 미리 정의해 둠.
  - 각 값 옆 주석으로 용도를 명시했으니, 필요 없는 줄은 지우고 가져다 쓰면 된다.

[Main Functions]
===========
- build_visitor_id: 방문자 식별자(VisitorId) — tntId/thirdPartyId/customerIds
- build_customer_id: Customer Attributes 매칭용 CustomerId(recipient_id 등)
- build_mbox: 단일 mbox 요청(파라미터·product·order 포함)
- build_delivery_request: 위 객체들을 묶은 최종 DeliveryRequest
- (TELECOM) build_view_signal_mbox / build_purchase_signal_mbox: 조회·전환 신호 적재용 mbox

[Endpoints/Classes/Functions]
=======================
- build_visitor_id(tnt_id?, third_party_id?, customer_ids?) -> VisitorId
- build_customer_id(recipient_id, integration_code?) -> CustomerId
- build_mbox(name, index?, parameters?, profile_parameters?, product?, order?) -> MboxRequest
- build_delivery_request(visitor_id, mbox, property_token) -> DeliveryRequest
- TELECOM_ENTITY_ATTRS_RESERVED(Adobe 예약) / TELECOM_ENTITY_ATTRS_CUSTOM(커스텀) / TELECOM_PROFILE_PARAMS
- build_view_signal_mbox(...) / build_purchase_signal_mbox(...) -> MboxRequest

[Dependencies]
=========
- delivery_api_client (Adobe 객체: DeliveryRequest, Context, ExecuteRequest, MboxRequest,
  VisitorId, CustomerId, Product, Order, ModelProperty, ChannelType, AuthenticatedState)
"""

from __future__ import annotations

import uuid
from typing import Optional

# 모두 Adobe 가 제공하는 Delivery 객체(target-python-sdk 와 함께 설치되는 delivery_api_client).
from delivery_api_client import (
    AuthenticatedState,
    ChannelType,
    Context,
    CustomerId,
    DeliveryRequest,
    ExecuteRequest,
    MboxRequest,
    ModelProperty,
    Order,
    Product,
    VisitorId,
)


# 1. 방문자 식별자(VisitorId) — 누구 기준으로 응답할지.
#    셋 다 비우면 빈 VisitorId 로 보내 Adobe 가 새 tntId 를 발급한다(신규 방문자).
def build_visitor_id(
    tnt_id: Optional[str] = None,        # Adobe 가 발급한 방문자 ID(재방문 시 그대로 전달해 동일인 유지)
    third_party_id: Optional[str] = None,  # 우리 CRM 키(예: recipient_id) — 프로필 매칭/세그먼트의 핵심 키
    customer_ids: Optional[list[CustomerId]] = None,  # Customer Attributes 매칭용 식별자 목록
) -> VisitorId:
    t = (tnt_id or "").strip() or None
    tp = (third_party_id or "").strip() or None
    cust = customer_ids or None
    if not t and not tp and not cust:
        return VisitorId()
    return VisitorId(tnt_id=t, third_party_id=tp, customer_ids=cust)


# 2. CustomerId — CRM 키(예: recipient_id)로 Customer Attributes(crs.*) 프로필을 매칭한다.
#    integration_code 는 Customer Attributes 데이터 소스의 통합 코드와 일치해야 한다.
def build_customer_id(recipient_id: str, integration_code: str = "recipient_id") -> CustomerId:
    return CustomerId(
        id=recipient_id.strip(),                          # 고객 식별값(예: "R8776...")
        integration_code=integration_code,                # CA 데이터 소스 통합 코드(스키마와 일치 필수)
        authenticated_state=AuthenticatedState.AUTHENTICATED,  # 로그인/인증된 사용자로 표시(프로필 신뢰도↑)
    )


# 3. 단일 mbox 요청 — "어떤 위치(location)"의 콘텐츠를 요청할지.
def build_mbox(
    name: str,                                          # mbox(location) 이름. 활동이 이 이름에 매칭됨
    index: int = 0,                                     # 한 요청에 여러 mbox 보낼 때의 순번
    parameters: Optional[dict[str, str]] = None,        # mbox 파라미터(entity.* 등) — 카탈로그/오디언스 조건
    profile_parameters: Optional[dict[str, str]] = None,  # profile.* — Adobe 프로필에 저장(세그먼트/스크립트)
    product: Optional[Product] = None,                  # 추천: 현재 보고 있는 상품(조회 신호)
    order: Optional[Order] = None,                      # 추천: 구매/전환(주문) 신호
) -> MboxRequest:
    return MboxRequest(
        name=name,
        index=index,
        parameters=parameters or None,
        profile_parameters=profile_parameters or None,
        product=product,
        order=order,
    )


# 4. (선택) 추천 학습용 상품·주문 객체 헬퍼.
#    purchased_product_ids 는 entity.id 와 동일해야 추천(BOUGHT_CF)이 학습된다.
def build_product(
    entity_id: str,        # 추천 단위 고유 ID(=entity.id). 카탈로그/피드의 기본 키와 일치해야 함
    category_id: str = "",  # 분류(요금제/단말/부가 등) — Collection 필터·조회 신호 분류
) -> Product:
    return Product(id=entity_id, category_id=category_id)


def build_order(
    order_id: str,                      # 주문 고유 ID(중복 방지). 전환 1건을 식별
    total: float,                       # 주문 금액(매출 가중·리포트). 통신사는 월정액/약정총액 등으로 환산
    purchased_product_ids: list[str],   # 구매(전환)된 entity.id 묶음 → co-purchase 쌍 학습의 원천
) -> Order:
    return Order(id=order_id, total=total, purchased_product_ids=purchased_product_ids)


# 5. 최종 Delivery 요청 — 빌더들을 하나로 묶는다. 이 객체를 client.get_offers 에 넣는다.
def build_delivery_request(
    visitor_id: VisitorId,    # 1번 빌더 결과(누구)
    mbox: MboxRequest,        # 3번 빌더 결과(무엇을)
    property_token: str,      # at_property 토큰(어느 Property 활동을 평가할지)
) -> DeliveryRequest:
    return DeliveryRequest(
        id=visitor_id,
        context=Context(channel=ChannelType.WEB),
        execute=ExecuteRequest(mboxes=[mbox]),
        _property=ModelProperty(token=property_token),
    )


# ══════════════════════════════════════════════════════════════════════════════
# [TELECOM] 통신사 웹/앱 추천 구축용 사전 정의 템플릿 & 신호 빌더
#   - 아래는 "쓸 수 있는 후보 전체"를 모아둔 것. 실제 구축 시 필요 없는 줄은 지우고 사용.
#   - 엔터티 속성(entity.*)은 mbox parameters 로 전송하거나 Feed 로 적재한다.
#   - 프로필 속성(profile.*)은 profile_parameters 로 전송하면 Adobe 프로필에 저장된다.
# ══════════════════════════════════════════════════════════════════════════════

# 4-A. 엔터티(카탈로그) 속성 — 추천 단위(요금제/단말/부가/결합) 메타데이터.
#      Collection 필터·Inclusion Rule·Attribute Weighting·디자인 변수($entity.*)에 사용.
#      ▼ 두 그룹으로 명확히 구분 ▼
#        [예약] = Adobe 기본 제공(이름·의미 고정 → 정의 없이 그대로 연동)
#        [커스텀] = 우리가 직접 정의(Adobe 미제공 → 통신사 추천 제안용)

# ── [예약] Adobe 기본 제공 엔터티 속성 (이름·의미 고정 / 그대로 사용 가능) ──
#    출처: Adobe Target > Recommendations > Entity Attributes 공식 문서.
TELECOM_ENTITY_ATTRS_RESERVED: dict[str, str] = {
    "entity.id": "PLAN_5G_PREMIUM",       # (필수) 고유 ID·조인 키. 공백·/·&·?·%·콤마 금지(하이픈/언더스코어만)
    "entity.name": "5G 프리미엄",          # 표시명 — 디자인(추천 카드) 노출
    "entity.categoryId": "plan",          # 분류 — Collection 필터 키. 콤마로 다중분류(덮어쓰지 않고 추가, 250자)
    "entity.value": "89000",              # 가격/월정액 — 정렬·Inclusion Rule. 소수점만(콤마 X)
    "entity.margin": "0.30",              # 마진 — Attribute Weighting(수익 우선 추천)에 활용
    "entity.inventory": "1",              # 재고/가입가능 수량 — inventory=0 제외 규칙에 사용
    "entity.brand": "Samsung",            # 제조사/브랜드 — 브랜드 필터·가중치
    "entity.message": "공시지원금 50만원",  # 프로모션/안내 문구 — 디자인 노출(이름보다 상세)
    "entity.thumbnailUrl": "https://cdn.example.com/p.png",  # 썸네일 — 디자인 노출
    "entity.pageUrl": "https://example.com/plan/5g",         # 상세 링크 — 추천 클릭 연결
    # 참고) entity.environment 는 시스템 예약어 → 커스텀으로 사용 불가(전송해도 무시됨).
}

# ── [커스텀] 통신사 추천 제안 속성 (entity.<name> 자유 정의, 최대 100개 / Adobe 미제공) ──
#    Collection 조건·Inclusion Rule·디자인 변수로 동일하게 동작하지만, 이름은 직접 정의해야 함.
TELECOM_ENTITY_ATTRS_CUSTOM: dict[str, str] = {
    "entity.network": "5G",                 # 네트워크(5G/LTE) — 단말↔요금제 호환 Inclusion Rule
    "entity.dataAllowance": "unlimited",    # 데이터 제공량 — 정렬/필터(상향 추천)
    "entity.contractTerm": "24",            # 약정 개월수 — 필터/세그먼트
    "entity.deviceCompat": "5G",            # 호환 단말 등급 — 결합(번들) 추천 규칙
    "entity.subscriptionType": "postpaid",  # 가입유형(postpaid/prepaid 후불/선불) — 세그먼트 필터
    "entity.bundleType": "mobile",          # 상품군(mobile/internet/iptv/combo) — 결합 추천 분류
    "entity.promoEndDate": "2026-12-31",    # 프로모션 종료일 — 만료 임박 정렬/제외
    "entity.discount": "500000",            # 할인/지원금액 — 정렬·Attribute Weighting
    "entity.popularity": "87",              # 인기/판매 지수(0~100) — 백업 추천 정렬 가중
}

# 4-B. 프로필(고객) 속성 — 그 고객이 "누구인지". profile_parameters 로 전송 시 Adobe 프로필에 생성·갱신
#      (profile.* 는 예약어가 아니라 보내는 순간 정의됨). 단순 전달값은 오디언스에서 바로 타겟 가능 —
#      profile script(user.*)는 "파생/계산값"이 필요할 때만 Audiences>Profile Scripts 에 정의(요청마다 서버 평가).
#      [엔터티와 분리 이유] entity.*='아이템'(Catalog·Collection·Inclusion·Design / 키=entity.id) vs
#        profile.*='사람'(오디언스·타겟 / 키=tntId·thirdPartyId) — 저장소·소비단계가 달라 섞지 않음.
#        접점) Inclusion Rule 비교 예: entity.id ≠ profile.currentPlan → 보유상품 제외.
#      [유용] 피드 없이 실시간·세션 즉시 개인화.  [주의] 프로필 만료(기본 비활동 14일)·영속 저장소 아님,
#        last-write 덮어쓰기(빈값 주의)·PII 금지 → 영속/대량 값은 Customer Attributes(crs.*) 권장.
TELECOM_PROFILE_PARAMS: dict[str, str] = {
    "profile.currentPlan": "LTE_BASIC",      # 현재 요금제 — "보유 상품 제외"·상향 추천
    "profile.contractEndDate": "2026-09-01",  # 약정 만료일 — 만료 임박 타겟(기변/재약정)
    "profile.dataUsageGB": "45",             # 월 데이터 사용량 — 상위 요금제 추천 트리거
    "profile.deviceModel": "SM-S921",        # 보유 단말 모델 — 기변 추천/호환성
    "profile.familyBundle": "N",             # 가족결합 여부(Y/N) — 결합 상향 제안
    "profile.ageBand": "30",                 # 연령대 — 세그먼트 타겟
    "profile.churnRisk": "high",             # 이탈위험 등급 — 리텐션 전용 오퍼
}


# 4-C. [조회 신호] 상세페이지 조회를 적재(order 없음).
#      "Most Viewed"·"Viewed This Viewed That"·"Recently Viewed" 알고리즘이 이 신호로 학습된다.
#      통신사는 구매가 드물어 조회 신호가 특히 중요하다.
def build_view_signal_mbox(
    name: str,                                          # 추천 mbox 이름
    entity_id: str,                                     # 조회한 추천 단위 ID(=entity.id)
    entity_attrs: Optional[dict[str, str]] = None,      # 4-A 템플릿(필요분만) — 카탈로그 enrich
    profile_params: Optional[dict[str, str]] = None,    # 4-B 템플릿(필요분만) — 고객 프로필
) -> MboxRequest:
    params = {"entity.id": entity_id, **(entity_attrs or {})}
    return build_mbox(
        name,
        parameters=params,
        profile_parameters=profile_params,
        product=build_product(entity_id, (entity_attrs or {}).get("entity.categoryId", "")),
        order=None,  # ★ 조회 신호이므로 order 를 보내지 않는다(구매로 오학습 방지)
    )


# 4-D. [전환 신호] 구매/가입/상담신청 등 고관여 전환을 order 로 적재.
#      통신사 핵심 전환(상담신청·가입신청)을 order 로 모델링하면 BOUGHT_CF 학습 데이터가 풍부해진다.
def build_purchase_signal_mbox(
    name: str,                                          # 추천 mbox 이름
    purchased_ids: list[str],                           # 전환된 entity.id 묶음(co-purchase 쌍)
    entities_total_value: float = 0.0,                  # 주문(전환) 총액: 묶음=품목가 합계, 단건=그 품목가
    entity_attrs: Optional[dict[str, str]] = None,      # 4-A 템플릿(필요분만)
    profile_params: Optional[dict[str, str]] = None,    # 4-B 템플릿(필요분만)
) -> MboxRequest:
    head = purchased_ids[0] if purchased_ids else ""
    params = {"entity.id": head, **(entity_attrs or {})}
    return build_mbox(
        name,
        parameters=params,
        profile_parameters=profile_params,
        product=build_product(head, (entity_attrs or {}).get("entity.categoryId", "")),
        order=build_order(f"ord_{uuid.uuid4().hex[:12]}", entities_total_value, purchased_ids),
    )
