/**
 * adobe_frontend.target_frontend.utils.targetHttp (Target fetch 공통 헬퍼)
 * ================================================================================
 * offers·profile-test·recommendation-test fetch 유틸이 공통으로 쓰던 부분을 한곳에 모은다:
 * API 베이스 URL, 쿠키 dict 의 value 추출, 세션 값 읽기, 응답 JSON 의 문자열 필드 추출,
 * 응답 → 세션 저장(tntId·thirdPartyId·target_cookie·location hint)의 동일 알고리즘.
 *
 * [Main Functions]
 * ===========
 * - targetApiBaseUrl: 백엔드 베이스 URL(env)
 * - cookieValue: 응답 쿠키 dict 의 value 문자열
 * - readSessionTrimmed: 세션 값 trim 조회
 * - stringFromData: 응답 객체에서 첫 비어있지 않은 문자열 필드
 * - persistVisitorSession: 응답에서 식별자·쿠키를 지정 키로 세션에 반영
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - targetApiBaseUrl(): string
 * - cookieValue(v): string
 * - readSessionTrimmed(key): string
 * - stringFromData(data, ...keys): string
 * - persistVisitorSession(data, keys): void
 * - VisitorSessionKeys
 *
 * [Dependencies]
 * =========
 * - @/utils/loadConfig (api_base_url / api_url)
 * - ./sessionStore (웹/네이티브 범용 세션 저장소)
 */

import { config } from "@/utils/loadConfig";
import { sessionGetItem, sessionSetItem } from "./sessionStore";

/** 응답에서 세션에 저장할 키 묶음. thirdPartyKey 가 없으면 thirdPartyId 는 저장하지 않는다. */
export interface VisitorSessionKeys {
  tntKey: string;
  thirdPartyKey?: string;
  cookieKey: string;
  locationHintKey: string;
}

const API_BASE_URL = config.api_base_url ?? config.api_url ?? "http://localhost:8010";

// 1. 백엔드 베이스 URL
export function targetApiBaseUrl(): string {
  return API_BASE_URL;
}

// 2. 응답 쿠키 dict({ value }) 의 value 문자열만 추출
export function cookieValue(v: unknown): string {
  if (v && typeof v === "object" && "value" in v) {
    const val = (v as { value?: unknown }).value;
    return typeof val === "string" ? val : "";
  }
  return "";
}

// 3. 세션 값 trim 조회(없으면 빈 문자열)
export function readSessionTrimmed(key: string): string {
  return sessionGetItem(key)?.trim() ?? "";
}

// 4. 응답 객체에서 주어진 키 순서로 첫 비어있지 않은 문자열을 찾는다(tntId·tnt_id 등 alias 대응)
export function stringFromData(data: unknown, ...keys: string[]): string {
  const rec = data && typeof data === "object" ? (data as Record<string, unknown>) : {};
  for (const key of keys) {
    const val = rec[key];
    if (typeof val === "string" && val) {
      return val;
    }
  }
  return "";
}

// 5. 응답 → 세션 반영(식별자·쿠키 순환의 단일 구현)
export function persistVisitorSession(data: unknown, keys: VisitorSessionKeys): void {
  const tnt = stringFromData(data, "tntId", "tnt_id");
  if (tnt) {
    sessionSetItem(keys.tntKey, tnt);
  }
  if (keys.thirdPartyKey) {
    const third = stringFromData(data, "thirdPartyId", "third_party_id");
    if (third) {
      sessionSetItem(keys.thirdPartyKey, third);
    }
  }
  const rec = data && typeof data === "object" ? (data as Record<string, unknown>) : {};
  const cookie = cookieValue(rec.target_cookie);
  if (cookie) {
    sessionSetItem(keys.cookieKey, cookie);
  }
  const hint = cookieValue(rec.target_location_hint_cookie);
  if (hint) {
    sessionSetItem(keys.locationHintKey, hint);
  }
}
