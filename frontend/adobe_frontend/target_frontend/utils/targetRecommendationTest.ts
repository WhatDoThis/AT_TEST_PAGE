/**
 * adobe_frontend.target_frontend.utils.targetRecommendationTest (Recommendations 테스트 fetch)
 * ================================================================================
 * Recommendations 전용 유틸. UI 는 `components/RecommendationTestPanel` 과 1:1 로 짝을 이룬다
 * (`targetProfileTest` ↔ `ProfileTestPanel`, `targetOffersFetch` ↔ 프리로드·메인 오퍼 흐름 과 동일 패턴).
 * `POST /api/target/recommendation-test` 로 entity.id·categoryId·price 를 보내고 JSON 오퍼·추천 배열을 받는다.
 * `entity.categoryId` 는 **`ss`(매장)가 아닐 때만** JSON 에 포함한다.
 *
 * [Main Functions]
 * ===========
 * - sendRecommendationTest: entity 클릭 시 Delivery 호출 + sessionStorage(AT_RECS_*) 갱신
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - sendRecommendationTest(params): Promise<Record<string, unknown>>
 *
 * [Dependencies]
 * =========
 * - ./targetSession (AT_RECS_*_KEY 상수)
 * - ./targetHttp (공통 fetch 헬퍼)
 */

import {
  persistVisitorSession,
  readSessionTrimmed,
  targetApiBaseUrl,
} from "./targetHttp";
import {
  AT_RECS_LOCATION_HINT_KEY,
  AT_RECS_TARGET_COOKIE_VALUE_KEY,
  AT_RECS_TNTID_STORAGE_KEY,
} from "./targetSession";

export interface RecommendationTestParams {
  entityId: string;
  entityCategoryId?: string;
  recipientId?: string;
  /** 메뉴 단가; 생략 시 백엔드 기본 1000 */
  price?: number;
}

export async function sendRecommendationTest(
  params: RecommendationTestParams,
): Promise<Record<string, unknown>> {
  const payload: Record<string, unknown> = {
    entity_id: params.entityId,
    recipient_id: params.recipientId ?? null,
    price: params.price ?? 1000,
    tnt_id: readSessionTrimmed(AT_RECS_TNTID_STORAGE_KEY) || null,
    target_cookie: readSessionTrimmed(AT_RECS_TARGET_COOKIE_VALUE_KEY) || null,
    target_location_hint: readSessionTrimmed(AT_RECS_LOCATION_HINT_KEY) || null,
  };
  const cat = (params.entityCategoryId ?? "").trim();
  if (cat && cat.toLowerCase() !== "ss") {
    payload.entity_category_id = cat;
  } else {
    payload.entity_category_id = null;
  }

  const res = await fetch(`${targetApiBaseUrl()}/api/target/recommendation-test`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;

  if (!res.ok) {
    const detail = data.detail;
    const msg =
      typeof detail === "string"
        ? detail
        : detail && typeof detail === "object" && "message" in detail
          ? String((detail as { message?: unknown }).message ?? res.statusText)
          : res.statusText || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  persistVisitorSession(data, {
    tntKey: AT_RECS_TNTID_STORAGE_KEY,
    cookieKey: AT_RECS_TARGET_COOKIE_VALUE_KEY,
    locationHintKey: AT_RECS_LOCATION_HINT_KEY,
  });

  return data;
}
