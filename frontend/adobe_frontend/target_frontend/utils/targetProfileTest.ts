/**
 * adobe_frontend.target_frontend.utils.targetProfileTest (profileParameters 저장 검증용 fetch)
 * ================================================================================
 * profile script test 전용 유틸. `POST /api/target/profile-test` 를 호출해
 * profileParameters 가 Target 프로필에 저장되는지(=응답 response_tokens 의 profile.* / 동일 tntId 재요청 시 오퍼 변동)
 * 검증한다. 기존 `targetOffersFetch` 와 분리되어 운영 오퍼 흐름을 건드리지 않는다.
 * 같은 폴더(`utils`)의 `targetRecommendationTest` 는 `RecommendationTestPanel` 전용(Recs API)이다.
 *
 * [Main Functions]
 * ===========
 * - testProfileParameters: profile_params 전송 + 응답을 받아 sessionStorage 갱신
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - testProfileParameters(params): Promise<ProfileTestResponse>
 *
 * [Dependencies]
 * =========
 * - ./targetSession (AT_*_KEY 상수)
 * - ./targetHttp (공통 fetch 헬퍼)
 */

import {
  persistVisitorSession,
  readSessionTrimmed,
  targetApiBaseUrl,
} from "./targetHttp";
import {
  AT_LOCATION_HINT_KEY,
  AT_SESSION_ID_KEY,
  AT_TARGET_COOKIE_VALUE_KEY,
  AT_THIRD_PARTY_ID_STORAGE_KEY,
  AT_TNTID_STORAGE_KEY,
} from "./targetSession";

export interface ProfileTestParams {
  profileParams: Record<string, string>;
  tntId?: string;
  thirdPartyId?: string;
  targetCookie?: string;
  locationHint?: string;
  sessionId?: string;
  pageUrl?: string;
}

export interface ProfileTestResponse {
  ok: boolean;
  status: number;
  data: Record<string, unknown>;
}

// profile script test
export async function testProfileParameters(
  params: ProfileTestParams,
): Promise<ProfileTestResponse> {
  const pageUrl =
    params.pageUrl ||
    (typeof window !== "undefined" && window.location?.href ? window.location.href : "");
  const payload: Record<string, unknown> = {
    profile_params: params.profileParams,
  };
  if (pageUrl) {
    payload.page_url = pageUrl;
  }
  const tntId = params.tntId ?? readSessionTrimmed(AT_TNTID_STORAGE_KEY);
  if (tntId) {
    payload.tnt_id = tntId;
  }
  const thirdPartyId = params.thirdPartyId ?? readSessionTrimmed(AT_THIRD_PARTY_ID_STORAGE_KEY);
  if (thirdPartyId) {
    payload.third_party_id = thirdPartyId;
  }
  const targetCookie = params.targetCookie ?? readSessionTrimmed(AT_TARGET_COOKIE_VALUE_KEY);
  if (targetCookie) {
    payload.target_cookie = targetCookie;
  }
  const locationHint = params.locationHint ?? readSessionTrimmed(AT_LOCATION_HINT_KEY);
  if (locationHint) {
    payload.target_location_hint = locationHint;
  }
  const sessionId = params.sessionId ?? readSessionTrimmed(AT_SESSION_ID_KEY);
  if (sessionId) {
    payload.session_id = sessionId;
  }

  const res = await fetch(`${targetApiBaseUrl()}/api/target/profile-test`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;

  if (res.ok) {
    persistVisitorSession(data, {
      tntKey: AT_TNTID_STORAGE_KEY,
      thirdPartyKey: AT_THIRD_PARTY_ID_STORAGE_KEY,
      cookieKey: AT_TARGET_COOKIE_VALUE_KEY,
      locationHintKey: AT_LOCATION_HINT_KEY,
    });
  }

  return { ok: res.ok, status: res.status, data };
}
