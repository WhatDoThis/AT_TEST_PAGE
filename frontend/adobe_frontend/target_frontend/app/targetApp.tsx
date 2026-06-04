/**
 * adobe_frontend.target_frontend.app.targetApp (Adobe Target 루트 Provider)
 * ================================================================================
 * Expo Router 루트에서 `AdobeTargetProvider` 만 주입한다.
 * offers 호출·Context 반영은 `TargetPageBootstrap` 단일 경로에서 수행한다.
 * 마운트 시 `hydrateSessionStore()`로 (네이티브) 세션 저장소를 메모리 캐시에 1회 적재하고,
 * `initAdobeMobileTarget()`으로 (네이티브) Adobe Mobile SDK를 appId로 1회 초기화하고 Target Property 토큰을 주입한다.
 * 초기화가 성공하면 `assurance_session_url` 이 설정된 경우 Assurance 검증 세션을 전역 1회 자동 시작한다
 * (property/workspace 가 하나라 화면 입력폼 대신 환경변수 고정값을 사용. PIN 은 앱 내 입력 화면에서 입력).
 * 모든 호출은 웹에서는 no-op 이므로 기존 웹 동작에는 영향이 없다.
 *
 * [Main Functions]
 * ===========
 * - TargetAppProvider: AdobeTargetProvider 래핑 + 세션 저장소 hydrate + 네이티브 SDK 초기화 + Assurance 자동 세션
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - TargetAppProvider
 *
 * [Dependencies]
 * =========
 * - react
 * - ../../../utils/loadConfig (`config.mobile_env.{adobe_mobile_app_id, adobe_target_property_token, assurance_session_url}`)
 * - ../context/targetContext (`AdobeTargetProvider`)
 * - ../utils/sessionStore (`hydrateSessionStore`)
 * - @adobe-native/native/adobeMobileTarget (`initAdobeMobileTarget`, `startAssuranceSession`)
 */

import { useEffect, type ReactNode } from "react";
import { config } from "../../../utils/loadConfig";
import { AdobeTargetProvider } from "../context/targetContext";
import {
  initAdobeMobileTarget,
  startAssuranceSession,
} from "@adobe-native/native/adobeMobileTarget";
import { hydrateSessionStore } from "../utils/sessionStore";

// 1. [Provider] 루트 레이아웃이 트리를 감싼다.
export function TargetAppProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // 웹은 sessionStorage 동기 접근이라 no-op, 네이티브만 AsyncStorage → 메모리 적재
    void hydrateSessionStore();
    // 네이티브 전용: Environment File ID(appId)로 SDK 초기화 + Target Property 토큰 주입 후
    // Assurance 세션 URL 이 있으면 전역 1회 자동 시작(웹은 모두 no-op).
    void (async () => {
      await initAdobeMobileTarget(
        config.mobile_env?.adobe_mobile_app_id ?? "",
        config.mobile_env?.adobe_target_property_token
      );
      const assuranceUrl = config.mobile_env?.assurance_session_url;
      if (assuranceUrl) {
        startAssuranceSession(assuranceUrl);
      }
    })();
  }, []);

  return <AdobeTargetProvider>{children}</AdobeTargetProvider>;
}
