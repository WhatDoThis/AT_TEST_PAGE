/**
 * adobe_frontend.target_frontend.utils.targetSession (범용 세션 저장소 + Adobe Target SDK 옵션)
 * ================================================================================
 * Delivery `id`(tntId·thirdPartyId)·target_cookie·location hint·session_id 를 `sessionStore`(웹 sessionStorage /
 * 네이티브 메모리+AsyncStorage)에 두고 다음 `POST /api/target/offers` 본문에 넣는다. **tntId 는 클라이언트에서 생성하지 않는다.**
 * 첫 요청은 thirdPartyId 만 전송 → Adobe 가 자동 생성한 tntId 가 응답으로 돌아오면 이를 저장해 재사용한다.
 * Recommendation 테스트(`targetRecommendationTest`) 전용 키(`AT_RECS_*`)는 offers·profile 과 저장소를 분리한다.
 *
 * [Main Functions]
 * ===========
 * - getAdobeTargetVisitorPayload: offers 용 저장 식별자·옵션 payload
 * - (상수) AT_RECS_* : recommendation-test 전용 키 정의만 — 읽기/쓰기는 `targetRecommendationTest`·`RecommendationTestPanel`
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - AT_TNTID_STORAGE_KEY · AT_THIRD_PARTY_ID_STORAGE_KEY · AT_TARGET_COOKIE_VALUE_KEY
 * - AT_LOCATION_HINT_KEY · AT_SESSION_ID_KEY (상수, offers·profile-test 공통)
 * - AT_RECS_* (상수, recommendation-test 전용 — 위 AT_* 와 저장소 분리)
 * - getAdobeTargetVisitorPayload()
 *
 * [Dependencies]
 * =========
 * - ./sessionStore (웹/네이티브 범용 세션 저장소)
 * - crypto(있을 때) — thirdPartyId·session_id 생성, 없으면 폴백
 */

import { sessionGetItem, sessionSetItem } from "./sessionStore";

/** Delivery `id.tntId` (Adobe 응답에서 받은 값만 저장) */
export const AT_TNTID_STORAGE_KEY = "at_tntId";
/** Delivery `id.thirdPartyId` (클라이언트에서 1회 생성·세션 동안 고정) */
export const AT_THIRD_PARTY_ID_STORAGE_KEY = "at_thirdPartyId";
/** SDK `target_cookie` 옵션에 넣을 쿠키 값 문자열(응답 dict 의 `value`). */
export const AT_TARGET_COOKIE_VALUE_KEY = "at_target_cookie_value";
/** SDK `target_location_hint` 옵션(응답 `target_location_hint_cookie.value`). */
export const AT_LOCATION_HINT_KEY = "at_location_hint";
/** SDK `session_id` — 동일 tnt/thirdParty 조합에 30분 내 재사용 권장. */
export const AT_SESSION_ID_KEY = "at_session_id";

// ── Recommendation 테스트 전용 (`targetRecommendationTest` / RecommendationTestPanel) ──
// offers·profile 용 `AT_*` 키 문자열과 겹치지 않게 별도 네임스페이스를 둔다.

/** Recs 테스트: Delivery 응답 tntId 재사용 */
export const AT_RECS_TNTID_STORAGE_KEY = "AT_RECS_TNTID";
/** Recs 테스트: SDK `target_cookie` 값(응답 `target_cookie.value`) */
export const AT_RECS_TARGET_COOKIE_VALUE_KEY = "AT_RECS_TARGET_COOKIE";
/** Recs 테스트: SDK `target_location_hint` 값 */
export const AT_RECS_LOCATION_HINT_KEY = "AT_RECS_LOCATION_HINT";
/** Recs 테스트: UI 입력 recipient_id 기본값·유지 */
export const AT_RECS_RECIPIENT_ID_KEY = "AT_RECS_RECIPIENT_ID";

function createThirdPartyId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `tp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`;
}

function getOrCreateSessionId(): string {
  let sid = sessionGetItem(AT_SESSION_ID_KEY)?.trim();
  if (!sid) {
    sid =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `sid_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    sessionSetItem(AT_SESSION_ID_KEY, sid);
  }
  return sid;
}

export function getAdobeTargetVisitorPayload(): Record<string, string> {
  const payload: Record<string, string> = {};

  const tntId = sessionGetItem(AT_TNTID_STORAGE_KEY)?.trim();
  if (tntId) {
    payload.tntId = tntId;
  }

  let thirdPartyId = sessionGetItem(AT_THIRD_PARTY_ID_STORAGE_KEY)?.trim();
  if (!thirdPartyId) {
    thirdPartyId = createThirdPartyId();
    sessionSetItem(AT_THIRD_PARTY_ID_STORAGE_KEY, thirdPartyId);
  }
  payload.thirdPartyId = thirdPartyId;

  const sessionId = getOrCreateSessionId();
  if (sessionId) {
    payload.session_id = sessionId;
  }

  const cookie = sessionGetItem(AT_TARGET_COOKIE_VALUE_KEY)?.trim();
  if (cookie) {
    payload.target_cookie = cookie;
  }
  const hint = sessionGetItem(AT_LOCATION_HINT_KEY)?.trim();
  if (hint) {
    payload.target_location_hint = hint;
  }

  return payload;
}
