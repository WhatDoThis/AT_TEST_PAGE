/**
 * adobe_frontend.target_frontend.utils.targetOffersFetch (Adobe Target offers POST 공통)
 * ================================================================================
 * `POST /api/target/offers` 요청 본문 구성·실행·sessionStorage(tnt) 갱신을 한곳에 둔다.
 * 초기 프리로드(`targetApp`)와 `refreshOffers`(클릭 직후 재조회)가 동일 경로를 쓴다.
 *
 * [Main Functions]
 * ===========
 * - fetchAdobeTargetOffersResponse: offers fetch + sessionStorage 반영, `{ ok, data }` 반환
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - fetchAdobeTargetOffersResponse()
 *
 * [Dependencies]
 * =========
 * - @/utils/loadConfig
 * - ./clickCookie (`getClickEventCookieParams`)
 * - ./targetSession (`getAdobeTargetVisitorPayload`, AT_TNT_STORAGE_KEY)
 */

import { config } from "@/utils/loadConfig";
import { getClickEventCookieParams } from "./clickCookie";
import {
  AT_TNT_STORAGE_KEY,
  getAdobeTargetVisitorPayload,
} from "./targetSession";

const API_BASE_URL = config.api_base_url ?? config.api_url ?? "http://localhost:8010";

// 1. 웹 offers API 호출(호출부에서 `Platform.OS` 가드). 응답 JSON과 HTTP 성공 여부를 반환한다.
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
      // ── Adobe Target ── 서버 Delivery `execute.*.parameters`에 평탄 전달
      ...(Object.keys(clickCookieParams).length > 0
        ? { params: clickCookieParams }
        : {}),
    }),
  });
  const data: unknown = await res.json().catch(() => ({}));
  if (res.ok && typeof sessionStorage !== "undefined") {
    const d = data as {
      tnt_id?: unknown;
    };
    if (typeof d?.tnt_id === "string" && d.tnt_id) {
      sessionStorage.setItem(AT_TNT_STORAGE_KEY, d.tnt_id);
    }
  }
  return { ok: res.ok, status: res.status, data };
}
