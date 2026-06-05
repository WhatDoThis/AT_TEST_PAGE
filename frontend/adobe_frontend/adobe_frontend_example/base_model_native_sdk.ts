/**
 * adobe_frontend_example.base_model_native_sdk (네이티브 Target SDK 객체 빌더 예시)
 * ================================================================================
 * 네이티브(앱) Adobe Target 요청을 만들 때 쓰는 **Adobe 제공 객체**(@adobe/react-native-aeptarget)를
 * 조립하는 빌더 모음. "Adobe 객체를 담는 베이스 모델" 역할 — 화면/도메인 코드와 분리해 여기서만 만든다.
 *
 * 네이티브 요청 한 건의 구조(아래 빌더가 만드는 것):
 *   TargetRequestObject(name, TargetParameters(params, profile, product, order), default, callback)
 *
 * ★ 통신사(텔코) 웹/앱 추천 구축 대비:
 *   - 하단 [TELECOM] 섹션에 "엔터티 속성·프로필 속성 템플릿"과 "조회/전환 신호 빌더"를 미리 정의해 둠.
 *   - 각 값 옆 주석으로 용도를 명시했으니, 필요 없는 줄은 지우고 가져다 쓰면 된다.
 *
 * [설치] (이미 설치되어 있다면 생략 — 참고용)
 * ===========
 * // npm install @adobe/react-native-aepcore @adobe/react-native-aeptarget @adobe/react-native-aepassurance
 * //   └ iOS 는 cd ios && pod install 필요. 네이티브 모듈이라 EAS 새 빌드 필요(OTA 불가).
 *
 * [Main Functions]
 * ===========
 * - buildParameters: TargetParameters(mbox/profile/product/order)
 * - buildProduct / buildOrder: 추천 학습용 상품·주문 객체
 * - buildRequest: 단일 mbox 요청(TargetRequestObject) + 콜백
 * - (TELECOM) buildViewSignal / buildPurchaseSignal: 조회·전환 신호 적재용 파라미터
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - RecommendationPayload(type)
 * - buildParameters(mboxParams?, profileParams?, product?, order?): TargetParameters
 * - buildProduct(entityId, categoryId?): TargetProduct
 * - buildOrder(orderId, total, purchasedIds): TargetOrder
 * - buildRequest(mboxName, parameters, defaultContent, onResult): TargetRequestObject
 * - TELECOM_ENTITY_ATTRS_RESERVED(Adobe 예약) / TELECOM_ENTITY_ATTRS_CUSTOM(커스텀) / TELECOM_PROFILE_PARAMS
 * - buildViewSignal(...) / buildPurchaseSignal(...): TargetParameters
 *
 * [Dependencies]
 * =========
 * - @adobe/react-native-aeptarget (TargetParameters, TargetProduct, TargetOrder, TargetRequestObject)
 */

// 모두 Adobe 가 제공하는 네이티브 Target SDK 클래스.
import {
  TargetParameters,
  TargetProduct,
  TargetOrder,
  TargetRequestObject,
} from "@adobe/react-native-aeptarget";

/** 추천 학습 데이터(구매/전환) 전송 페이로드 예시 타입. 통신사 확장 필드는 모두 선택. */
export type RecommendationPayload = {
  entityId: string;            // (필수) 추천 단위 고유 ID(=entity.id) — 모든 신호/피드의 조인 키
  categoryId: string;          // 분류(plan/device/addon/bundle) — Collection 필터 키
  entityValue?: number;        // (선택) entityId 단건 카탈로그 가격 — entity.value(정렬·Inclusion)
  entitiesTotalValue: number;  // 주문(전환) 총액: 묶음=품목가 합계, 단건=그 품목가 — 매출 가중/리포트
  /** 구매(전환)된 entity.id 묶음. Adobe 제한: 개당 50자, 콤마 연결 총 250자. co-purchase 쌍 학습 원천 */
  purchasedProductIds: string[];
  entityAttrs?: Record<string, string>;   // (선택) 4-A 엔터티 속성(필요분만) — 카탈로그 enrich
  profileParams?: Record<string, string>; // (선택) 4-B 프로필 속성(필요분만) — 고객 세그먼트
};

// 1. 추천 학습용 상품 객체. 현재 보고 있는/전환된 상품을 표현(조회·구매 공통).
export function buildProduct(
  entityId: string,    // 추천 단위 고유 ID(=entity.id)
  categoryId = "",     // 분류 — Collection 필터/조회 신호 분류
): TargetProduct {
  return new TargetProduct(entityId, categoryId);
}

// 2. 추천 학습용 주문(전환) 객체. purchasedProductIds 가 entity.id 와 같아야 추천이 학습된다.
export function buildOrder(
  orderId: string,                // 주문 고유 ID(중복 방지) — 전환 1건 식별
  total: number,                  // 전환 금액 — 매출 가중/리포트
  purchasedProductIds: string[],  // 전환된 entity.id 묶음 — co-purchase 쌍 학습
): TargetOrder {
  return new TargetOrder(orderId, total, purchasedProductIds);
}

// 3. 파라미터 묶음 — mbox 파라미터 + (선택) 프로필/상품/주문.
//    인자 순서가 SDK 규약: (mboxParameters, profileParameters, product, order)
export function buildParameters(
  mboxParameters: Record<string, string> = {},   // entity.* 등 — 카탈로그/오디언스 조건
  profileParameters?: Record<string, string>,     // profile.* — Adobe 프로필 저장(세그먼트/스크립트)
  product?: TargetProduct,                         // 조회 신호(현재 상품)
  order?: TargetOrder,                             // 전환(주문) 신호
): TargetParameters {
  return new TargetParameters(mboxParameters, profileParameters, product, order);
}

// 4. 단일 mbox 요청 객체 — 이름·파라미터·기본값·결과 콜백.
//    콜백 시그니처: (error, content) — 오류 시 error 가 채워지고 content 는 보통 null.
export function buildRequest(
  mboxName: string,                                          // mbox(location) 이름 — 활동이 매칭
  parameters: TargetParameters,                             // 3번 빌더 결과
  defaultContent: string,                                   // 활동 없을 때 폴백 콘텐츠
  onResult: (error: unknown, content: string | null) => void,  // 결과 콜백
): TargetRequestObject {
  return new TargetRequestObject(mboxName, parameters, defaultContent, onResult);
}

// ══════════════════════════════════════════════════════════════════════════════
// [TELECOM] 통신사 웹/앱 추천 구축용 사전 정의 템플릿 & 신호 빌더
//   - 아래는 "쓸 수 있는 후보 전체". 실제 구축 시 필요 없는 줄은 지우고 사용.
//   - 엔터티 속성(entity.*)은 mbox parameters 로 전송하거나 Feed 로 적재.
//   - 프로필 속성(profile.*)은 profileParameters 로 전송 → Adobe 프로필에 저장.
// ══════════════════════════════════════════════════════════════════════════════

// 4-A. 엔터티(카탈로그) 속성 — 추천 단위(요금제/단말/부가/결합) 메타데이터.
//      Collection 필터·Inclusion Rule·Attribute Weighting·디자인 변수($entity.*)에 사용.
//      ▼ 두 그룹으로 명확히 구분 ▼
//        [예약]  = Adobe 기본 제공(이름·의미 고정 → 정의 없이 그대로 연동)
//        [커스텀] = 직접 정의(Adobe 미제공 → 통신사 추천 제안용)

// ── [예약] Adobe 기본 제공 엔터티 속성 (이름·의미 고정 / 그대로 사용 가능) ──
//    출처: Adobe Target > Recommendations > Entity Attributes 공식 문서.
export const TELECOM_ENTITY_ATTRS_RESERVED: Record<string, string> = {
  "entity.id": "PLAN_5G_PREMIUM",       // (필수) 고유 ID·조인 키. 공백·/·&·?·%·콤마 금지(하이픈/언더스코어만)
  "entity.name": "5G 프리미엄",          // 표시명 — 추천 카드 노출
  "entity.categoryId": "plan",          // 분류 — Collection 필터 키. 콤마로 다중분류(덮어쓰지 않고 추가, 250자)
  "entity.value": "89000",              // 가격/월정액 — 정렬·Inclusion Rule. 소수점만(콤마 X)
  "entity.margin": "0.30",              // 마진 — Attribute Weighting(수익 우선 추천)
  "entity.inventory": "1",              // 재고/가입가능 수량 — inventory=0 제외 규칙
  "entity.brand": "Samsung",            // 제조사/브랜드 — 브랜드 필터·가중치
  "entity.message": "공시지원금 50만원",  // 프로모션/안내 문구 — 디자인 노출(이름보다 상세)
  "entity.thumbnailUrl": "https://cdn.example.com/p.png", // 썸네일 — 디자인 노출
  "entity.pageUrl": "https://example.com/plan/5g",        // 상세 링크 — 클릭 연결
  // 참고) entity.environment 는 시스템 예약어 → 커스텀으로 사용 불가(전송해도 무시됨).
};

// ── [커스텀] 통신사 추천 제안 속성 (entity.<name> 자유 정의, 최대 100개 / Adobe 미제공) ──
//    Collection 조건·Inclusion Rule·디자인 변수로 동일하게 동작하지만, 이름은 직접 정의해야 함.
export const TELECOM_ENTITY_ATTRS_CUSTOM: Record<string, string> = {
  "entity.network": "5G",                 // 네트워크(5G/LTE) — 단말↔요금제 호환 Inclusion Rule
  "entity.dataAllowance": "unlimited",    // 데이터 제공량 — 정렬/필터(상향 추천)
  "entity.contractTerm": "24",            // 약정 개월수 — 필터/세그먼트
  "entity.deviceCompat": "5G",            // 호환 단말 등급 — 결합(번들) 추천 규칙
  "entity.subscriptionType": "postpaid",  // 가입유형(postpaid/prepaid 후불/선불) — 세그먼트 필터
  "entity.bundleType": "mobile",          // 상품군(mobile/internet/iptv/combo) — 결합 추천 분류
  "entity.promoEndDate": "2026-12-31",    // 프로모션 종료일 — 만료 임박 정렬/제외
  "entity.discount": "500000",            // 할인/지원금액 — 정렬·Attribute Weighting
  "entity.popularity": "87",              // 인기/판매 지수(0~100) — 백업 추천 정렬 가중
};

// 4-B. 프로필(고객) 속성 — "누구인지". profileParameters 로 전송 시 Adobe 프로필에 생성·갱신
//      (profile.* 는 예약어가 아니라 보내는 순간 정의됨). 단순 전달값은 오디언스에서 바로 타겟 가능 —
//      profile script(user.*)는 "파생/계산값"이 필요할 때만 Audiences>Profile Scripts 에 정의(요청마다 서버 평가).
//      [엔터티와 분리 이유] entity.*='아이템'(Catalog·Collection·Inclusion·Design / 키=entity.id) vs
//        profile.*='사람'(오디언스·타겟 / 키=tntId·thirdPartyId) — 저장소·소비단계가 달라 섞지 않음.
//        접점) Inclusion Rule 비교 예: entity.id ≠ profile.currentPlan → 보유상품 제외.
//      [유용] 피드 없이 실시간·세션 즉시 개인화.  [주의] 프로필 만료(기본 비활동 14일)·영속 저장소 아님,
//        last-write 덮어쓰기(빈값 주의)·PII 금지 → 영속/대량 값은 Customer Attributes(crs.*) 권장.
export const TELECOM_PROFILE_PARAMS: Record<string, string> = {
  "profile.currentPlan": "LTE_BASIC",       // 현재 요금제 — "보유 상품 제외"·상향 추천
  "profile.contractEndDate": "2026-09-01",  // 약정 만료일 — 만료 임박 타겟(기변/재약정)
  "profile.dataUsageGB": "45",              // 월 데이터 사용량 — 상위 요금제 추천 트리거
  "profile.deviceModel": "SM-S921",         // 보유 단말 모델 — 기변 추천/호환성
  "profile.familyBundle": "N",              // 가족결합 여부(Y/N) — 결합 상향 제안
  "profile.ageBand": "30",                  // 연령대 — 세그먼트 타겟
  "profile.churnRisk": "high",              // 이탈위험 등급 — 리텐션 전용 오퍼
};

// 4-C. [조회 신호] 상세페이지 조회 적재(order 없음).
//      "Most Viewed"·"Viewed This Viewed That"·"Recently Viewed" 학습. 통신사는 구매가 드물어 특히 중요.
export function buildViewSignal(
  entityId: string,                          // 조회한 추천 단위 ID
  entityAttrs?: Record<string, string>,      // 4-A(필요분만)
  profileParams?: Record<string, string>,    // 4-B(필요분만)
): TargetParameters {
  const params = { "entity.id": entityId, ...(entityAttrs ?? {}) };
  // ★ order 를 주지 않는다(구매로 오학습 방지) — 조회 신호 전용.
  return buildParameters(
    params,
    profileParams,
    buildProduct(entityId, entityAttrs?.["entity.categoryId"] ?? ""),
    undefined,
  );
}

// 4-D. [전환 신호] 구매/가입/상담신청 등 고관여 전환을 order 로 적재.
//      통신사 핵심 전환(상담·가입)을 order 로 모델링하면 BOUGHT_CF 학습 데이터가 풍부해진다.
export function buildPurchaseSignal(
  purchasedIds: string[],                    // 전환된 entity.id 묶음
  entitiesTotalValue = 0,                    // 주문(전환) 총액: 묶음=품목가 합계, 단건=그 품목가
  entityAttrs?: Record<string, string>,      // 4-A(필요분만)
  profileParams?: Record<string, string>,    // 4-B(필요분만)
): TargetParameters {
  const head = purchasedIds[0] ?? "";
  const params = { "entity.id": head, ...(entityAttrs ?? {}) };
  const orderId = `ord_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  return buildParameters(
    params,
    profileParams,
    buildProduct(head, entityAttrs?.["entity.categoryId"] ?? ""),
    buildOrder(orderId, entitiesTotalValue, purchasedIds),
  );
}
