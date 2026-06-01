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
 * - @/utils/loadConfig (api_base_url / api_url)
 * - ./targetSession (AT_*_KEY 상수)
 * - ./sessionStore (웹/네이티브 범용 세션 저장소)
 */

import { config } from "@/utils/loadConfig";
import { sessionGetItem, sessionSetItem } from "./sessionStore";
import {
  AT_LOCATION_HINT_KEY,
  AT_SESSION_ID_KEY,
  AT_TARGET_COOKIE_VALUE_KEY,
  AT_THIRD_PARTY_ID_STORAGE_KEY,
  AT_TNTID_STORAGE_KEY,
} from "./targetSession";

const API_BASE_URL = config.api_base_url ?? config.api_url ?? "http://localhost:8010";

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

function _readSession(key: string): string {
  return sessionGetItem(key)?.trim() ?? "";
}

function _cookieValue(v: unknown): string {
  if (v && typeof v === "object" && "value" in v) {
    const val = (v as { value?: unknown }).value;
    return typeof val === "string" ? val : "";
  }
  return "";
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
  const tntId = params.tntId ?? _readSession(AT_TNTID_STORAGE_KEY);
  if (tntId) {
    payload.tnt_id = tntId;
  }
  const thirdPartyId = params.thirdPartyId ?? _readSession(AT_THIRD_PARTY_ID_STORAGE_KEY);
  if (thirdPartyId) {
    payload.third_party_id = thirdPartyId;
  }
  const targetCookie = params.targetCookie ?? _readSession(AT_TARGET_COOKIE_VALUE_KEY);
  if (targetCookie) {
    payload.target_cookie = targetCookie;
  }
  const locationHint = params.locationHint ?? _readSession(AT_LOCATION_HINT_KEY);
  if (locationHint) {
    payload.target_location_hint = locationHint;
  }
  const sessionId = params.sessionId ?? _readSession(AT_SESSION_ID_KEY);
  if (sessionId) {
    payload.session_id = sessionId;
  }

  const res = await fetch(`${API_BASE_URL}/api/target/profile-test`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;

  if (res.ok) {
    const tntVal =
      (typeof data.tntId === "string" && data.tntId) ||
      (typeof data.tnt_id === "string" && (data.tnt_id as string)) ||
      "";
    if (tntVal) {
      sessionSetItem(AT_TNTID_STORAGE_KEY, tntVal);
    }
    const thirdVal =
      (typeof data.thirdPartyId === "string" && data.thirdPartyId) ||
      (typeof data.third_party_id === "string" && (data.third_party_id as string)) ||
      "";
    if (thirdVal) {
      sessionSetItem(AT_THIRD_PARTY_ID_STORAGE_KEY, thirdVal);
    }
    const tcVal = _cookieValue(data.target_cookie);
    if (tcVal) {
      sessionSetItem(AT_TARGET_COOKIE_VALUE_KEY, tcVal);
    }
    const lhVal = _cookieValue(data.target_location_hint_cookie);
    if (lhVal) {
      sessionSetItem(AT_LOCATION_HINT_KEY, lhVal);
    }
  }

  return { ok: res.ok, status: res.status, data };
}
