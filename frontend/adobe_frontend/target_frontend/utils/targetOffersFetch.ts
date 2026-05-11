/**
 * adobe_frontend.target_frontend.utils.targetOffersFetch (Adobe Target offers POST 공통)
 * ================================================================================
 * `POST /api/target/offers` 요청·sessionStorage 갱신(tntId, thirdPartyId, SDK 쿠키·hint).
 */

import { config } from "@/utils/loadConfig";
import { getClickEventCookieParams } from "./clickCookie";
import {
  AT_LOCATION_HINT_KEY,
  AT_TARGET_COOKIE_VALUE_KEY,
  AT_THIRD_PARTY_ID_STORAGE_KEY,
  AT_TNTID_STORAGE_KEY,
  getAdobeTargetVisitorPayload,
} from "./targetSession";

const API_BASE_URL = config.api_base_url ?? config.api_url ?? "http://localhost:8010";

function cookieValueFromResponse(v: unknown): string {
  if (v && typeof v === "object" && "value" in v) {
    const val = (v as { value?: unknown }).value;
    return typeof val === "string" ? val : "";
  }
  return "";
}

export async function fetchAdobeTargetOffersResponse(): Promise<{
  ok: boolean;
  status: number;
  data: unknown;
}> {
  const clickCookieParams = getClickEventCookieParams();
  const res = await fetch(`${API_BASE_URL}/api/target/offers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...(typeof window !== "undefined" && window.location?.href
        ? { page_url: window.location.href }
        : {}),
      ...getAdobeTargetVisitorPayload(),
      ...(Object.keys(clickCookieParams).length > 0
        ? { params: clickCookieParams }
        : {}),
    }),
  });
  const data: unknown = await res.json().catch(() => ({}));
  if (res.ok && typeof sessionStorage !== "undefined") {
    const d = data as {
      tntId?: unknown;
      tnt_id?: unknown;
      thirdPartyId?: unknown;
      third_party_id?: unknown;
      target_cookie?: unknown;
      target_location_hint_cookie?: unknown;
    };
    const tntVal =
      (typeof d?.tntId === "string" && d.tntId) ||
      (typeof d?.tnt_id === "string" && d.tnt_id) ||
      "";
    if (tntVal) {
      sessionStorage.setItem(AT_TNTID_STORAGE_KEY, tntVal);
    }
    const thirdVal =
      (typeof d?.thirdPartyId === "string" && d.thirdPartyId) ||
      (typeof d?.third_party_id === "string" && d.third_party_id) ||
      "";
    if (thirdVal) {
      sessionStorage.setItem(AT_THIRD_PARTY_ID_STORAGE_KEY, thirdVal);
    }
    const tcVal = cookieValueFromResponse(d.target_cookie);
    if (tcVal) {
      sessionStorage.setItem(AT_TARGET_COOKIE_VALUE_KEY, tcVal);
    }
    const lhVal = cookieValueFromResponse(d.target_location_hint_cookie);
    if (lhVal) {
      sessionStorage.setItem(AT_LOCATION_HINT_KEY, lhVal);
    }
  }
  return { ok: res.ok, status: res.status, data };
}
