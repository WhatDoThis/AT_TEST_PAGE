/**
 * ga4_frontend.ga4-test.ga4Events (GA4 dataLayer 모의 이벤트 push · 부트스트랩/라우트)
 * ================================================================================
 * 유플홈(U+) GA4 dataLayer 구조를 모방한 이벤트 push 함수 모음(부트스트랩·라우트 그룹).
 * 인터랙션 이벤트(상품클릭·회원가입·로그인·클릭·커스텀)는 ga4Events_interaction 로 분리하고
 * 이 파일에서 재-export 하여 소비 측은 여기 한곳만 import 하면 된다.
 *  - [Bootstrap] 페이지 로드 시 GA4/GTM 이 자동으로 쌓는 이벤트(gtm.js·nuxtRoute·gtm.dom·gtm.load)
 *  - [Route] nuxtRoute 기반 페이지뷰 — behavior_var 프리셋(PC/Mobile×채널)으로 조합 주입
 * 실제 GA4·GTM 은 로드하지 않고 ga4DataLayer 코어로만 배열에 쌓는다. behavior_var 필드명은
 * 실제 유플홈 샘플에 존재하는 3개(behavior_channel_type/behavior_host_type/site_category)만 사용한다.
 *
 * [Main Functions]
 * ===========
 * - buildBehaviorVar: host_type/channel_type 조합으로 behavior_var 생성(site_category 자동 조립)
 * - pushGtmInit / pushGtmDom / pushGtmLoad: GTM 예약 부트스트랩 이벤트
 * - pushNuxtRoute: 페이지 데이터(nuxtRoute) 이벤트(behavior_var 주입 가능)
 * - pushPageViewPreset: 프리셋(PC/Mobile×채널) 기반 페이지뷰 push
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - BEHAVIOR_VAR_PRESETS: Record<BehaviorVarPresetKey, Ga4BehaviorVar>
 * - buildBehaviorVar(hostType, channelType): Ga4BehaviorVar
 * - pushGtmInit(): void
 * - pushNuxtRoute(pageTitle, pageUrl, routeName, behaviorVar?): void
 * - pushGtmDom(): void
 * - pushGtmLoad(): void
 * - pushPageViewPreset(preset): void
 * - (재-export) pushProductClick, pushSignup, pushLogin, pushGtmClick, pushCustomEvent
 *
 * [Dependencies]
 * =========
 * - ./ga4DataLayer (dataLayerPush, nextUniqueEventId)
 * - ./ga4DataLayer.types (Ga4BehaviorVar)
 * - ./ga4Events_interaction (인터랙션 이벤트 재-export)
 */

import { dataLayerPush, nextUniqueEventId } from "./ga4DataLayer";
import type { Ga4BehaviorVar } from "./ga4DataLayer.types";

// 고객 세그먼트(site_category 마지막 토큰) — 실제 샘플의 "개인" 을 기본값으로 둔다.
const PERSONAL_SEGMENT = "개인";

/** behavior_var 프리셋 키. host_type(환경) × channel_type(채널) 조합. */
export type BehaviorVarPresetKey =
  | "pc_main"
  | "mobile_main"
  | "pc_test"
  | "mobile_test";

// 1. [Route] host_type/channel_type 로 behavior_var 를 만든다(site_category 는 "환경|채널|세그먼트").
export function buildBehaviorVar(
  hostType: string,
  channelType: string
): Ga4BehaviorVar {
  return {
    behavior_channel_type: channelType,
    behavior_host_type: hostType,
    site_category: `${hostType}|${channelType}|${PERSONAL_SEGMENT}`,
  };
}

/** 환경(PC/Mobile) × 채널(대표채널/테스트채널) 조합 프리셋. 값은 테스트용이며 필드명은 실제와 동일. */
export const BEHAVIOR_VAR_PRESETS: Record<BehaviorVarPresetKey, Ga4BehaviorVar> = {
  pc_main: buildBehaviorVar("PC", "대표채널"),
  mobile_main: buildBehaviorVar("Mobile", "대표채널"),
  pc_test: buildBehaviorVar("PC", "테스트채널"),
  mobile_test: buildBehaviorVar("Mobile", "테스트채널"),
};

// 2. [Bootstrap] GTM 초기화(gtm.js) 이벤트
export function pushGtmInit(): void {
  dataLayerPush({
    "gtm.start": new Date().getTime(),
    event: "gtm.js",
    "gtm.uniqueEventId": nextUniqueEventId(),
  });
}

// 3. [Bootstrap/Route] 페이지 데이터(nuxtRoute) — behavior_var 미지정 시 PC/대표채널 기본 프리셋
export function pushNuxtRoute(
  pageTitle: string,
  pageUrl: string,
  routeName: string,
  behaviorVar: Ga4BehaviorVar = BEHAVIOR_VAR_PRESETS.pc_main
): void {
  dataLayerPush({
    event: "nuxtRoute",
    pageTitle,
    pageType: "PageView",
    pageUrl,
    routeName,
    behavior_var: { ...behaviorVar },
    "gtm.uniqueEventId": nextUniqueEventId(),
  });
}

// 4. [Bootstrap] GTM DOM Ready(gtm.dom) 이벤트
export function pushGtmDom(): void {
  dataLayerPush({
    event: "gtm.dom",
    "gtm.uniqueEventId": nextUniqueEventId(),
  });
}

// 5. [Bootstrap] GTM Load(gtm.load) 이벤트
export function pushGtmLoad(): void {
  dataLayerPush({
    event: "gtm.load",
    "gtm.uniqueEventId": nextUniqueEventId(),
  });
}

// 6. [Route] 프리셋(PC/Mobile×채널) 기반 페이지뷰 — Target 오디언스 조건 조합 테스트용
export function pushPageViewPreset(preset: BehaviorVarPresetKey): void {
  const bv = BEHAVIOR_VAR_PRESETS[preset];
  pushNuxtRoute(
    `테스트 페이지 · ${bv.behavior_host_type}/${bv.behavior_channel_type}`,
    `/test/${preset}`,
    `test-${preset}`,
    bv
  );
}

// 인터랙션 이벤트(상품클릭·회원가입·로그인·클릭·커스텀)는 분리 파일에서 재-export
export {
  pushProductClick,
  pushSignup,
  pushLogin,
  pushGtmClick,
  pushCustomEvent,
} from "./ga4Events_interaction";
