/**
 * adobe_frontend.target_frontend.utils.targetOffersFetch (Adobe Target offers POST 공통)
 * ================================================================================
 * 백엔드 `POST /api/target/offers`(Python SDK `get_offers`) 호출·세션 저장소 갱신(웹/네이티브 범용).
 * 같은 `utils` 폴더: `targetProfileTest`, `targetRecommendationTest` 는 별도 엔드포인트 전용.
 *
 * [Main Functions]
 * ===========
 * - fetchAdobeTargetOffersResponse: 단일 POST·sessionStorage 반영
 * - fetchAdobeTargetOffersResponseDeduped: mbox 단위 단일 비행·force 시 해당 mbox 캐시 무효화
 * - getAdobeBootstrapMboxNameForFetch: 초기 bootstrap 전용 mbox 이름(설정 또는 기본값)
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - fetchAdobeTargetOffersResponse({ mboxName?, params?, force? })
 * - fetchAdobeTargetOffersResponseDeduped({ mboxName?, params?, force? })
 * - getAdobeBootstrapMboxNameForFetch()
 *
 * [Dependencies]
 * =========
 * - @/utils/loadConfig
 * - ./clickCookie, ./targetSession, ./sessionStore
 */

import { config } from "@/utils/loadConfig";
import { getClickEventCookieParams } from "./clickCookie";
import { sessionSetItem } from "./sessionStore";
import {
  AT_LOCATION_HINT_KEY,
  AT_TARGET_COOKIE_VALUE_KEY,
  AT_THIRD_PARTY_ID_STORAGE_KEY,
  AT_TNTID_STORAGE_KEY,
  getAdobeTargetVisitorPayload,
} from "./targetSession";

const API_BASE_URL = config.api_base_url ?? config.api_url ?? "http://localhost:8010";

export type AdobeTargetOffersFetchOptions = {
  mboxName?: string;
  params?: Record<string, string>;
  /** dedupe 경로에서는 무시. 시그니처 통일용. */
  force?: boolean;
};

export type AdobeTargetOffersFetchResult = {
  ok: boolean;
  status: number;
  data: unknown;
};

const _dedupeByMbox = new Map<string, Promise<AdobeTargetOffersFetchResult>>();

function _defaultOfferMboxName(): string {
  const v = config.adobe_mboxes?.offer_mbox_name?.trim();
  return v && v.length > 0 ? v : "target-local-mbox";
}

export function getAdobeBootstrapMboxNameForFetch(): string {
  const v = config.adobe_mboxes?.bootstrap_mbox_name?.trim();
  return v && v.length > 0 ? v : "target-ready-mbox";
}

function cookieValueFromResponse(v: unknown): string {
  if (v && typeof v === "object" && "value" in v) {
    const val = (v as { value?: unknown }).value;
    return typeof val === "string" ? val : "";
  }
  return "";
}

function _mergeParams(extra?: Record<string, string>): Record<string, string> | undefined {
  const click = getClickEventCookieParams();
  const merged: Record<string, string> = { ...click, ...(extra ?? {}) };
  return Object.keys(merged).length > 0 ? merged : undefined;
}

// 1. 단일 POST. `mboxName` 생략 시 앱 설정의 offer mbox.
export async function fetchAdobeTargetOffersResponse(
  options?: AdobeTargetOffersFetchOptions,
): Promise<AdobeTargetOffersFetchResult> {
  void options?.force;
  const mboxName = (options?.mboxName ?? _defaultOfferMboxName()).trim() || _defaultOfferMboxName();
  const body: Record<string, unknown> = {
    mbox_name: mboxName,
    ...getAdobeTargetVisitorPayload(),
  };
  if (typeof window !== "undefined" && window.location?.href) {
    body.page_url = window.location.href;
  }
  const mergedParams = _mergeParams(options?.params);
  if (mergedParams) {
    body.params = mergedParams;
  }

  const res = await fetch(`${API_BASE_URL}/api/target/offers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data: unknown = await res.json().catch(() => ({}));
  if (res.ok) {
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
      sessionSetItem(AT_TNTID_STORAGE_KEY, tntVal);
    }
    const thirdVal =
      (typeof d?.thirdPartyId === "string" && d.thirdPartyId) ||
      (typeof d?.third_party_id === "string" && d.third_party_id) ||
      "";
    if (thirdVal) {
      sessionSetItem(AT_THIRD_PARTY_ID_STORAGE_KEY, thirdVal);
    }
    const tcVal = cookieValueFromResponse(d.target_cookie);
    if (tcVal) {
      sessionSetItem(AT_TARGET_COOKIE_VALUE_KEY, tcVal);
    }
    const lhVal = cookieValueFromResponse(d.target_location_hint_cookie);
    if (lhVal) {
      sessionSetItem(AT_LOCATION_HINT_KEY, lhVal);
    }
  }
  return { ok: res.ok, status: res.status, data };
}

// 2. mbox 이름 단위로 in-flight 공유. `force: true` 는 해당 mbox 캐시만 삭제 후 새 요청.
export function fetchAdobeTargetOffersResponseDeduped(
  options?: AdobeTargetOffersFetchOptions,
): Promise<AdobeTargetOffersFetchResult> {
  const mboxName = (options?.mboxName ?? _defaultOfferMboxName()).trim() || _defaultOfferMboxName();
  const key = mboxName;
  if (options?.force) {
    _dedupeByMbox.delete(key);
  }
  let inflight = _dedupeByMbox.get(key);
  if (!inflight) {
    inflight = fetchAdobeTargetOffersResponse({
      mboxName,
      params: options?.params,
    }).catch((err) => {
      _dedupeByMbox.delete(key);
      throw err;
    });
    _dedupeByMbox.set(key, inflight);
  }
  return inflight;
}
