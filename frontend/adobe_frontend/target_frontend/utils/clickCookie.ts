/**
 * adobe_frontend.target_frontend.utils.clickCookie (클릭 이벤트 쿠키 기록)
 * ================================================================================
 * 웹에서만 동작하는 쿠키 쓰기 유틸이다. Audience·노출 판단은 Adobe Target이 담당하고,
 * 본 모듈은 `clickEvent{n}` 쿠키를 설정하고, 백엔드 Target `params`용으로 읽어 평탄 객체로 돌려준다.
 *
 * [Main Functions]
 * ===========
 * - setClickCookie: 이미지 클릭 시 대응 인덱스 쿠키 저장
 * - getClickEventCookieParams: `clickEvent{n}` 만 골라 `Record<string, string>` 로 반환
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - setClickCookie(index)
 * - getClickEventCookieParams()
 *
 * [Dependencies]
 * =========
 * - react-native Platform
 */

import { Platform } from "react-native";

// ── Adobe Target ── 서버 프록시 Delivery에 넘길 mbox 파라미터 키와 동일한 이름 규칙
const CLICK_EVENT_COOKIE_NAME = /^clickEvent\d+$/;

function _safeDecodeCookieValue(raw: string): string {
  try {
    return decodeURIComponent(raw.replace(/\+/g, " "));
  } catch {
    return raw;
  }
}

// 1. 이미지 클릭 시 Target Audience용 쿠키만 설정한다(읽기·조건 판단 없음).
export function setClickCookie(index: number): void {
  if (Platform.OS !== "web") {
    return;
  }
  if (typeof document === "undefined") {
    return;
  }
  // ── Adobe Target ── 방문자 프로필용 clickEvent 쿠키(서버 Audience 규칙과 이름 일치)
  document.cookie = `clickEvent${index}=true; path=/; max-age=1800`;
  console.log(`[Adobe Target] clickEvent${index} cookie set`);
}

// 2. document.cookie 에서 `clickEvent{n}` 만 추출해 Target `params`(평탄 키·문자열 값)로 쓴다.
export function getClickEventCookieParams(): Record<string, string> {
  if (Platform.OS !== "web" || typeof document === "undefined") {
    return {};
  }
  // ── Adobe Target ──
  const chunk = document.cookie;
  if (!chunk.trim()) {
    return {};
  }
  const found: Record<string, string> = {};
  for (const part of chunk.split(";")) {
    const trimmed = part.trim();
    const eq = trimmed.indexOf("=");
    if (eq <= 0) {
      continue;
    }
    const name = trimmed.slice(0, eq).trim();
    if (!CLICK_EVENT_COOKIE_NAME.test(name)) {
      continue;
    }
    const value = trimmed.slice(eq + 1).trim();
    found[name] = _safeDecodeCookieValue(value);
  }
  const keys = Object.keys(found).sort((a, b) => {
    const na = Number(a.replace(/\D/g, "")) || 0;
    const nb = Number(b.replace(/\D/g, "")) || 0;
    return na - nb;
  });
  const out: Record<string, string> = {};
  for (const k of keys) {
    out[k] = found[k] ?? "";
  }
  return out;
}
