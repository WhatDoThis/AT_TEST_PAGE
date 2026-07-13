/**
 * ga4_frontend.ga4-test.Ga4PageBootstrap (GA4 dataLayer 페이지 로드 자동 push)
 * ================================================================================
 * 페이지가 로드되면 GA4/GTM 이 자동으로 쌓는 순서(gtm.js → nuxtRoute → gtm.dom → gtm.load)를
 * 모의로 push 한다. 웹에서만 동작하며(네이티브·SSR 은 no-op), 앱 생애주기 동안 1회만 실행한다.
 * UI 는 렌더하지 않는다(effect 전용). Adobe Tags 의 Google Data Layer Extension 이 이 값을 읽는다.
 *
 * [Main Functions]
 * ===========
 * - Ga4PageBootstrap: 마운트 시 부트스트랩 이벤트 시퀀스를 1회 push
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - Ga4PageBootstrap(): null (렌더 없음)
 *
 * [Dependencies]
 * =========
 * - react (useEffect)
 * - react-native (Platform)
 * - @ga4/ga4DataLayer (ensureDataLayer)
 * - @ga4/ga4Events (pushGtmInit, pushNuxtRoute, pushGtmDom, pushGtmLoad)
 */

import { useEffect } from "react";
import { Platform } from "react-native";
import { ensureDataLayer } from "@ga4/ga4DataLayer";
import {
  pushGtmInit,
  pushNuxtRoute,
  pushGtmDom,
  pushGtmLoad,
} from "@ga4/ga4Events";

// 라우트 재마운트에도 부트스트랩이 중복 push 되지 않도록 모듈 스코프 1회 가드.
let bootstrapped = false;

// 1. 루트/메인에서 마운트 — 웹에서만 부트스트랩 시퀀스를 1회 push
export default function Ga4PageBootstrap() {
  useEffect(() => {
    // 웹이 아니거나 이미 부트스트랩됐으면 조기 반환(가드 클로즈)
    if (Platform.OS !== "web" || bootstrapped) {
      return;
    }
    if (typeof window === "undefined") {
      return;
    }
    bootstrapped = true;

    ensureDataLayer();
    pushGtmInit();

    const pageTitle = typeof document !== "undefined" ? document.title : "";
    const pageUrl = `${window.location.pathname}${window.location.search}`;
    pushNuxtRoute(pageTitle, pageUrl, "at-test-main");

    pushGtmDom();

    // gtm.load: 이미 로드 완료면 즉시, 아니면 load 이벤트에서 1회 push
    if (typeof document !== "undefined" && document.readyState === "complete") {
      pushGtmLoad();
    } else {
      window.addEventListener("load", () => pushGtmLoad(), { once: true });
    }
  }, []);

  return null;
}
