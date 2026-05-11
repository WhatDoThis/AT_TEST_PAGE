/**
 * adobe_frontend.target_frontend.utils.targetSession (웹 sessionStorage + Adobe Target SDK 옵션)
 * ================================================================================
 * Delivery `id`(tntId·thirdPartyId), `get_offers`용 target_cookie 문자열, location hint,
 * session_id 를 sessionStorage에 두고 다음 `POST /api/target/offers` 본문에 넣는다.
 */

/** Delivery `id.tntId` */
export const AT_TNTID_STORAGE_KEY = "at_tntId";
/** Delivery `id.thirdPartyId` */
export const AT_THIRD_PARTY_ID_STORAGE_KEY = "at_thirdPartyId";
/** SDK `target_cookie` 옵션에 넣을 쿠키 값 문자열(응답 dict의 `value`). */
export const AT_TARGET_COOKIE_VALUE_KEY = "at_target_cookie_value";
/** SDK `target_location_hint` 옵션(응답 `target_location_hint_cookie.value`). */
export const AT_LOCATION_HINT_KEY = "at_location_hint";
/** SDK `session_id` — 동일 tnt/thirdParty 조합에 30분 내 재사용 권장. */
export const AT_SESSION_ID_KEY = "at_session_id";

const LEGACY_AT_TNT_STORAGE_KEY = "at_tnt_id";

function createThirdPartyId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `tp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`;
}

function getOrCreateSessionId(): string {
  if (typeof sessionStorage === "undefined") {
    return "";
  }
  let sid = sessionStorage.getItem(AT_SESSION_ID_KEY)?.trim();
  if (!sid) {
    sid =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `sid_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem(AT_SESSION_ID_KEY, sid);
  }
  return sid;
}

export function getAdobeTargetVisitorPayload(): {
  tntId?: string;
  thirdPartyId?: string;
  target_cookie?: string;
  target_location_hint?: string;
  session_id?: string;
} {
  if (typeof sessionStorage === "undefined") {
    return {};
  }
  let third = sessionStorage.getItem(AT_THIRD_PARTY_ID_STORAGE_KEY)?.trim();
  if (!third) {
    third = createThirdPartyId();
    sessionStorage.setItem(AT_THIRD_PARTY_ID_STORAGE_KEY, third);
  }
  const tnt =
    sessionStorage.getItem(AT_TNTID_STORAGE_KEY)?.trim() ||
    sessionStorage.getItem(LEGACY_AT_TNT_STORAGE_KEY)?.trim();
  const out: {
    tntId?: string;
    thirdPartyId?: string;
    target_cookie?: string;
    target_location_hint?: string;
    session_id?: string;
  } = { thirdPartyId: third, session_id: getOrCreateSessionId() };
  if (tnt) {
    out.tntId = tnt;
  }
  const tc = sessionStorage.getItem(AT_TARGET_COOKIE_VALUE_KEY)?.trim();
  if (tc) {
    out.target_cookie = tc;
  }
  const lh = sessionStorage.getItem(AT_LOCATION_HINT_KEY)?.trim();
  if (lh) {
    out.target_location_hint = lh;
  }
  return out;
}
