/**
 * ga4_frontend.ga4-test.ga4DataLayer.types (GA4 dataLayer 모의 공용 타입)
 * ================================================================================
 * GA4/GTM 의 `window.dataLayer` 를 모의(Mock)할 때 push 하는 항목들의 타입을 모은다.
 * 실제 GA4(gtag.js)·GTM 컨테이너는 로드하지 않으며, 순수 배열/객체로만 동작시킨다.
 * 유플홈(U+) GA4 dataLayer 구조(nuxtRoute·behavior_var 등)를 모방한다.
 *
 * [Main Functions]
 * ===========
 * - (타입 전용) dataLayer 항목·이벤트 스키마 정의
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - Ga4DataLayerItem: dataLayer 배열 원소(자유 확장 가능한 객체)
 * - Ga4BehaviorVar: 유플홈 behavior_var 블록
 * - Ga4NuxtRouteEvent: 페이지 데이터(nuxtRoute) 이벤트
 *
 * [Dependencies]
 * =========
 * - 없음(브라우저 window.dataLayer 전용)
 */

/** dataLayer 배열의 원소. GTM 이벤트는 키가 다양하므로 확장 가능한 객체로 둔다. */
export type Ga4DataLayerItem = Record<string, unknown>;

/** 유플홈 GA4 의 behavior_var 블록(방문 맥락 분류). */
export type Ga4BehaviorVar = {
  behavior_channel_type: string;
  behavior_host_type: string;
  site_category: string;
};

/** 페이지 데이터(핵심) — 유플홈 nuxtRoute 이벤트 구조. */
export type Ga4NuxtRouteEvent = {
  event: "nuxtRoute";
  pageTitle: string;
  pageType: string;
  pageUrl: string;
  routeName: string;
  behavior_var: Ga4BehaviorVar;
  "gtm.uniqueEventId"?: number;
};
