/**
 * ga4_frontend.ga4-test.ga4DataLayer (GA4 dataLayer 모의 코어)
 * ================================================================================
 * GA4/GTM 없이 `window.dataLayer` 배열을 직접 초기화·push·조회하는 저수준 유틸.
 * GA4 가 내부적으로 하는 것과 동일하게 배열을 만들고 항목을 push 한다(순수 JS 배열).
 * SSR/네이티브 등 window 가 없는 환경에서는 안전하게 no-op(가드 클로즈)으로 동작한다.
 *
 * [Main Functions]
 * ===========
 * - isGa4Supported: 현재 환경에서 window.dataLayer 사용 가능 여부(웹=true)
 * - ensureDataLayer: window.dataLayer 를 배열로 보장(없으면 생성)
 * - dataLayerPush: dataLayer 에 항목 1개 push
 * - getDataLayer: 현재 dataLayer 배열 조회(모니터용)
 * - nextUniqueEventId: gtm.uniqueEventId 증가 시퀀스
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - isGa4Supported(): boolean
 * - ensureDataLayer(): Ga4DataLayerItem[]
 * - dataLayerPush(item): void
 * - getDataLayer(): Ga4DataLayerItem[]
 * - nextUniqueEventId(): number
 *
 * [Dependencies]
 * =========
 * - ./ga4DataLayer.types (Ga4DataLayerItem)
 */

import type { Ga4DataLayerItem } from "./ga4DataLayer.types";

declare global {
  interface Window {
    dataLayer?: Ga4DataLayerItem[];
  }
}

// GTM 의 gtm.uniqueEventId 를 모방하기 위한 모듈 스코프 시퀀스(로드/이벤트마다 증가).
let uniqueEventIdSeq = 0;

// 1. 지원 여부 — 브라우저(웹)에서만 window.dataLayer 사용 가능
export function isGa4Supported(): boolean {
  return typeof window !== "undefined";
}

// 2. dataLayer 보장 — 없으면 GA4 와 동일하게 빈 배열로 초기화
export function ensureDataLayer(): Ga4DataLayerItem[] {
  if (typeof window === "undefined") {
    return [];
  }
  if (!Array.isArray(window.dataLayer)) {
    window.dataLayer = window.dataLayer || [];
  }
  return window.dataLayer as Ga4DataLayerItem[];
}

// 3. push — window 가 없으면 no-op, 있으면 dataLayer 에 항목 추가
export function dataLayerPush(item: Ga4DataLayerItem): void {
  if (typeof window === "undefined") {
    return;
  }
  const layer = ensureDataLayer();
  layer.push(item);
}

// 4. 조회 — 현재 dataLayer 배열(모니터/디버그용)
export function getDataLayer(): Ga4DataLayerItem[] {
  if (typeof window === "undefined") {
    return [];
  }
  return Array.isArray(window.dataLayer) ? window.dataLayer : [];
}

// 5. gtm.uniqueEventId 시퀀스 — 호출 시마다 1씩 증가
export function nextUniqueEventId(): number {
  uniqueEventIdSeq += 1;
  return uniqueEventIdSeq;
}
