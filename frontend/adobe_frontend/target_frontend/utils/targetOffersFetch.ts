/**
 * adobe_frontend.target_frontend.utils.targetOffersFetch (Adobe Target offers POST 공통)
 * ================================================================================
 * 백엔드 `POST /api/target/offers`(Python SDK `get_offers`) 호출·세션 저장소 갱신(웹/네이티브 범용).
 * 같은 `utils` 폴더: `targetProfileTest`, `targetRecommendationTest` 는 별도 엔드포인트 전용.
 *
 * [Main Functions]
 * ===========
 * - fetchAdobeTargetOffersResponse: 단일 POST·sessionStorage 반영
 * - fetchAdobeTargetOffersResponseDeduped: 역할(offer/bootstrap) 단위 단일 비행·force 시 해당 역할 캐시 무효화
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - fetchAdobeTargetOffersResponse({ bootstrap?, params?, force? })
 * - fetchAdobeTargetOffersResponseDeduped({ bootstrap?, params?, force? })
 *
 * [Dependencies]
 * =========
 * - ./clickCookie, ./targetSession, ./targetHttp
 */

import { getClickEventCookieParams } from "./clickCookie";
import { persistVisitorSession, targetApiBaseUrl } from "./targetHttp";
import {
  AT_LOCATION_HINT_KEY,
  AT_TARGET_COOKIE_VALUE_KEY,
  AT_THIRD_PARTY_ID_STORAGE_KEY,
  AT_TNTID_STORAGE_KEY,
  getAdobeTargetVisitorPayload,
} from "./targetSession";

export type AdobeTargetOffersFetchOptions = {
  /** true 면 서버가 config.adobe.json 의 bootstrap_mbox_name 을, false 면 offer_mbox_name 을 사용한다. */
  bootstrap?: boolean;
  params?: Record<string, string>;
  /** dedupe 경로에서는 무시. 시그니처 통일용. */
  force?: boolean;
};

export type AdobeTargetOffersFetchResult = {
  ok: boolean;
  status: number;
  data: unknown;
};

const _dedupeByRole = new Map<string, Promise<AdobeTargetOffersFetchResult>>();

function _roleKey(bootstrap?: boolean): string {
  return bootstrap ? "bootstrap" : "offer";
}

function _mergeParams(extra?: Record<string, string>): Record<string, string> | undefined {
  const click = getClickEventCookieParams();
  const merged: Record<string, string> = { ...click, ...(extra ?? {}) };
  return Object.keys(merged).length > 0 ? merged : undefined;
}

// 1. 단일 POST. mbox 이름은 보내지 않고 역할(bootstrap)만 알리면 서버가 config.adobe.json 으로 결정한다.
export async function fetchAdobeTargetOffersResponse(
  options?: AdobeTargetOffersFetchOptions,
): Promise<AdobeTargetOffersFetchResult> {
  void options?.force;
  const body: Record<string, unknown> = {
    ...getAdobeTargetVisitorPayload(),
  };
  if (options?.bootstrap) {
    body.bootstrap = true;
  }
  if (typeof window !== "undefined" && window.location?.href) {
    body.page_url = window.location.href;
  }
  const mergedParams = _mergeParams(options?.params);
  if (mergedParams) {
    body.params = mergedParams;
  }

  const res = await fetch(`${targetApiBaseUrl()}/api/target/offers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data: unknown = await res.json().catch(() => ({}));
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

// 2. 역할(offer/bootstrap) 단위로 in-flight 공유. `force: true` 는 해당 역할 캐시만 삭제 후 새 요청.
export function fetchAdobeTargetOffersResponseDeduped(
  options?: AdobeTargetOffersFetchOptions,
): Promise<AdobeTargetOffersFetchResult> {
  const key = _roleKey(options?.bootstrap);
  if (options?.force) {
    _dedupeByRole.delete(key);
  }
  let inflight = _dedupeByRole.get(key);
  if (!inflight) {
    inflight = fetchAdobeTargetOffersResponse({
      bootstrap: options?.bootstrap,
      params: options?.params,
    }).catch((err) => {
      _dedupeByRole.delete(key);
      throw err;
    });
    _dedupeByRole.set(key, inflight);
  }
  return inflight;
}
