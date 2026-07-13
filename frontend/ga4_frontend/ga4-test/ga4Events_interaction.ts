/**
 * ga4_frontend.ga4-test.ga4Events_interaction (GA4 dataLayer 모의 · 인터랙션 이벤트)
 * ================================================================================
 * 테스트 패널 버튼으로 발생시키는 사용자 인터랙션 이벤트 push 모음([Interaction] 그룹).
 * ga4Events(부트스트랩/라우트)에서 재-export 되어 소비 측은 ga4Events 한곳만 import 한다.
 * gtm.click 은 실제 GTM 처럼 DOM 요소(gtm.element)를 참조하지 않고, mock 재현이 쉬운
 * 문자열 필드(gtm.elementText/Classes/Id)만 담은 간소화 버전으로 만든다.
 *
 * [Main Functions]
 * ===========
 * - pushProductClick: 상품 클릭 이벤트
 * - pushSignup: 회원가입 이벤트
 * - pushLogin: 로그인 이벤트
 * - pushGtmClick: 클릭(gtm.click) 이벤트(간소화 — DOM 참조 없음)
 * - pushCustomEvent: 이벤트명(+선택 key/value) 자유 push
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - pushProductClick(): void
 * - pushSignup(): void
 * - pushLogin(): void
 * - pushGtmClick(clickText, clickClasses?): void
 * - pushCustomEvent(eventName, key?, value?): void
 *
 * [Dependencies]
 * =========
 * - ./ga4DataLayer (dataLayerPush, nextUniqueEventId)
 */

import { dataLayerPush, nextUniqueEventId } from "./ga4DataLayer";

// 1. [Interaction] 상품 클릭
export function pushProductClick(): void {
  dataLayerPush({
    event: "productClick",
    pageTitle: "테스트 상품 클릭",
    pageType: "ProductClick",
    product: {
      product_name: "5G 프리미엄 요금제",
      product_id: "PLAN_5G_PREMIUM_001",
      product_category: "요금제|5G",
      product_price: "89000",
    },
  });
}

// 2. [Interaction] 회원가입
export function pushSignup(): void {
  dataLayerPush({
    event: "signUp",
    pageTitle: "회원가입 완료",
    pageType: "Conversion",
    user_info: {
      user_type: "new_member",
      signup_method: "email",
      age_group: "30s",
    },
  });
}

// 3. [Interaction] 로그인
export function pushLogin(): void {
  dataLayerPush({
    event: "login",
    pageTitle: "로그인",
    pageType: "Login",
    user_info: {
      user_type: "member",
      login_method: "id_password",
      membership_level: "gold",
    },
  });
}

// 4. [Interaction] 클릭(gtm.click) — GTM 예약 이벤트의 간소화 mock(DOM 요소 참조 제외)
export function pushGtmClick(
  clickText: string,
  clickClasses: string = "test-btn"
): void {
  dataLayerPush({
    event: "gtm.click",
    "gtm.uniqueEventId": nextUniqueEventId(),
    "gtm.elementText": clickText,
    "gtm.elementClasses": clickClasses,
    "gtm.elementId": "",
  });
}

// 5. [Interaction] 커스텀 이벤트 — 이벤트명(+선택 key/value)로 자유 push
export function pushCustomEvent(
  eventName: string,
  key?: string,
  value?: string
): void {
  // 이벤트명이 비면 push 하지 않는다(가드 클로즈).
  if (!eventName || eventName.trim().length === 0) {
    return;
  }
  const pushData: Record<string, unknown> = { event: eventName.trim() };
  if (key && value) {
    pushData[key] = value;
  }
  dataLayerPush(pushData);
}
