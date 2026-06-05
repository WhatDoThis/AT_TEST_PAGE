"""
adobe_backend_example.delivery_python_sdk (Adobe Target Delivery 호출 예시)
================================================================================
초기화된 클라이언트(client_python_sdk)와 Adobe 객체 빌더(base_model_python_sdk)를 이용해
실제 Delivery 호출(`get_offers`)을 수행하고, 응답에서 오퍼·식별자를 꺼내는 **최소 사용 예시**.

호출 한 줄: `client.get_offers({"request": delivery_request, ...옵션})`

[Main Functions]
===========
- get_offers_example: 단일 mbox 오퍼 조회(가장 기본)
- get_recommendations_example: 추천 mbox 조회 + meta/items 파싱
- offers_from_response: 응답에서 오퍼 옵션 목록 추출
- ids_from_response: 응답에서 tntId/thirdPartyId 추출

[Endpoints/Classes/Functions]
=======================
- get_offers_example(mbox_name, mbox_parameters?, tnt_id?, third_party_id?) -> dict
- get_recommendations_example(mbox_name, entity_id, category_id?, recipient_id?, entity_value?, entities_total_value?, purchased_ids?) -> dict
- offers_from_response(response) -> list[dict]
- ids_from_response(response) -> dict

[Dependencies]
=========
- .client_python_sdk (get_target_client, get_property_token)
- .base_model_python_sdk (Adobe 객체 빌더)
- delivery_api_client.exceptions (ApiException)
"""

from __future__ import annotations

import json
import uuid
from typing import Any, Optional

from delivery_api_client.exceptions import ApiException

from adobe_backend.adobe_backend_example.base_model_python_sdk import (
    build_customer_id,
    build_delivery_request,
    build_mbox,
    build_order,
    build_product,
    build_visitor_id,
)
from adobe_backend.adobe_backend_example.client_python_sdk import (
    get_property_token,
    get_target_client,
)


# ──────────────────────────────────────────────────────────────────────────────
# 응답 파서 — get_offers 응답은 dict 이며 주요 구조는 다음과 같다.
#   {
#     "response": DeliveryResponse(
#         status, request_id,
#         id = VisitorId(tnt_id, third_party_id, ...),
#         execute = ExecuteResponse(mboxes=[ MboxResponse(name, options=[Option(content, type)]) ])
#     ),
#     "target_cookie": {...},                 # 다음 요청에 그대로 돌려줄 쿠키
#     "target_location_hint_cookie": {...},   # 엣지 라우팅 힌트 쿠키
#   }
# ──────────────────────────────────────────────────────────────────────────────


# 1. 응답 → 오퍼 옵션 목록. parse_json=True 면 content(JSON 문자열)를 dict 로 변환 시도.
def offers_from_response(response: Optional[dict], *, parse_json: bool = False) -> list[dict[str, Any]]:
    resp = response.get("response") if response else None
    execute = getattr(resp, "execute", None)
    if not execute:
        return []
    offers: list[dict[str, Any]] = []
    for mbox in execute.mboxes or []:
        for opt in getattr(mbox, "options", None) or []:
            content = getattr(opt, "content", None)
            if parse_json and isinstance(content, str):
                try:
                    content = json.loads(content)
                except (json.JSONDecodeError, ValueError):
                    pass
            offers.append(
                {
                    "mbox_name": getattr(mbox, "name", None),
                    "type": getattr(opt, "type", None),
                    "content": content,
                }
            )
    return offers


# 2. 응답 → 방문자 식별자(다음 호출에 재사용해 동일 방문자를 유지).
def ids_from_response(response: Optional[dict]) -> dict[str, Any]:
    resp = response.get("response") if response else None
    rid = getattr(resp, "id", None)
    out: dict[str, Any] = {}
    if rid:
        if getattr(rid, "tnt_id", None):
            out["tntId"] = rid.tnt_id
        if getattr(rid, "third_party_id", None):
            out["thirdPartyId"] = rid.third_party_id
    # 쿠키도 함께 돌려주면 클라이언트가 다음 요청에 실어 보낼 수 있다.
    for key in ("target_cookie", "target_location_hint_cookie"):
        val = (response or {}).get(key)
        if isinstance(val, dict) and val:
            out[key] = val
    return out


# 3. [기본] 단일 mbox 오퍼 조회.
#    요청 예시(JSON 으로 받는다고 가정):
#       { "mbox_name": "target-global-mbox",
#         "mbox_parameters": {"page": "home"},
#         "tnt_id": null, "third_party_id": null }
#    반환 예시:
#       { "mbox": "target-global-mbox",
#         "offers": [{"mbox_name": "...", "type": "html", "content": "..."}],
#         "tntId": "...", "thirdPartyId": null, "target_cookie": {...} }
def get_offers_example(
    mbox_name: str,
    mbox_parameters: Optional[dict[str, str]] = None,
    tnt_id: Optional[str] = None,
    third_party_id: Optional[str] = None,
) -> dict[str, Any]:
    visitor_id = build_visitor_id(tnt_id, third_party_id)
    mbox = build_mbox(mbox_name, parameters=mbox_parameters)
    request = build_delivery_request(visitor_id, mbox, get_property_token())

    try:
        # ★ 실제 호출. 동기 함수이므로 FastAPI 등 async 환경에서는
        #    `await asyncio.to_thread(get_offers_example, ...)` 로 감싸 호출한다.
        response = get_target_client().get_offers({"request": request})
    except ApiException as exc:
        # 운영에서는 상태코드별로 4xx/5xx 매핑(예: HTTPException)으로 변환한다.
        raise RuntimeError(f"Adobe Target delivery failed: {exc.status}") from exc

    return {
        "mbox": mbox_name,
        "offers": offers_from_response(response),
        **ids_from_response(response),
    }


# 4. [추천] Recommendations mbox 조회 — entity·product·order + (선택) recipient 프로필.
#    적재(학습)도 같은 형태로 보낸다(주문/조회가 누적되어 알고리즘이 학습).
#    가격은 의미가 둘로 나뉜다(혼동 주의):
#      - entity_value         : entity_id "단건"의 카탈로그 가격(정렬·Inclusion Rule).
#      - entities_total_value : 주문(전환) 총액 — 묶음이면 품목가 "합계", 단건이면 그 품목가.
#    묶음 구매면 purchased_ids 로 여러 entity.id 를 전달(기본은 [entity_id] 단일).
#    반환 예시:
#       { "mbox": "target-recs-mbox", "status": 200,
#         "recommendations": [{"entityId":"21","name":"americano",...}, ...],
#         "recommendations_meta": {"algorithmName":"...","keyName":"..."},
#         "tntId": "...", "thirdPartyId": "R8776..." }
def get_recommendations_example(
    mbox_name: str,
    entity_id: str,
    category_id: str = "",
    recipient_id: Optional[str] = None,
    entity_value: Optional[float] = None,        # entity_id 단건 카탈로그 가격(미지정 시 entity.value 미전송)
    entities_total_value: float = 0.0,           # 주문(전환) 총액: 묶음=품목가 합계, 단건=그 품목가
    purchased_ids: Optional[list[str]] = None,   # 묶음 구매 시 entity.id 목록(기본: [entity_id])
) -> dict[str, Any]:
    recipient = (recipient_id or "").strip()
    third_party_id = recipient or str(uuid.uuid4())
    customer_ids = [build_customer_id(recipient)] if recipient else None
    ids = purchased_ids or [entity_id]

    params = {"entity.id": entity_id, "entity.categoryId": category_id}
    # entity.value = 단건 품목 가격(주문 총액과 다름). 소수점만 허용(콤마 X).
    if entity_value is not None and entity_value > 0:
        params["entity.value"] = f"{entity_value:.2f}"

    visitor_id = build_visitor_id(third_party_id=third_party_id, customer_ids=customer_ids)
    mbox = build_mbox(
        mbox_name,
        parameters=params,
        product=build_product(entity_id, category_id),
        # order.total = 전환 총액(묶음이면 합계). purchased_ids = 묶음 품목 전체.
        order=build_order(f"ord_{uuid.uuid4().hex[:12]}", entities_total_value, ids),
    )
    request = build_delivery_request(visitor_id, mbox, get_property_token())

    try:
        response = get_target_client().get_offers({"request": request})
    except ApiException as exc:
        raise RuntimeError(f"Adobe Target recommendations failed: {exc.status}") from exc

    # 디자인(JSON) 출력 계약: { "meta": {...}, "items": [ {...}, ... ] }
    recommendations: list[Any] = []
    meta: dict[str, Any] = {}
    for offer in offers_from_response(response, parse_json=True):
        content = offer.get("content")
        if isinstance(content, dict):
            if isinstance(content.get("meta"), dict):
                meta.update(content["meta"])
            if isinstance(content.get("items"), list):
                recommendations.extend(content["items"])
        elif isinstance(content, list):
            recommendations.extend(content)

    resp = response.get("response") if response else None
    return {
        "mbox": mbox_name,
        "status": getattr(resp, "status", None) if resp else None,
        "recommendations": recommendations,
        "recommendations_meta": meta,
        **ids_from_response(response),
    }


# ──────────────────────────────────────────────────────────────────────────────
# [FastAPI 연동 예시] — 실제 시스템에서는 아래처럼 라우터에 붙인다(이 파일은 SDK 부분만 담음).
#
#   from fastapi import FastAPI, HTTPException
#   import asyncio
#
#   app = FastAPI()
#
#   @app.post("/api/target/offers")
#   async def offers(body: dict):
#       try:
#           # 동기 SDK 호출은 to_thread 로 이벤트 루프를 막지 않게 한다.
#           return await asyncio.to_thread(
#               get_offers_example,
#               body["mbox_name"], body.get("mbox_parameters"),
#               body.get("tntId"), body.get("thirdPartyId"),
#           )
#       except RuntimeError as exc:
#           raise HTTPException(status_code=502, detail=str(exc))
# ──────────────────────────────────────────────────────────────────────────────
