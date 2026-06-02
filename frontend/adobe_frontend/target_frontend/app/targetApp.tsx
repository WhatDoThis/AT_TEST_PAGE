/**
 * adobe_frontend.target_frontend.app.targetApp (Adobe Target 루트 Provider)
 * ================================================================================
 * Expo Router 루트에서 `AdobeTargetProvider` 만 주입한다.
 * offers 호출·Context 반영은 `TargetPageBootstrap` 단일 경로에서 수행한다.
 * 마운트 시 `hydrateSessionStore()`로 (네이티브) 세션 저장소를 메모리 캐시에 1회 적재하고,
 * `initAdobeMobileTarget()`으로 (네이티브) Adobe Mobile SDK를 appId로 1회 초기화한다.
 * 두 호출 모두 웹에서는 no-op 이므로 기존 웹 동작에는 영향이 없다.
 *
 * [Main Functions]
 * ===========
 * - TargetAppProvider: AdobeTargetProvider 래핑 + 세션 저장소 hydrate + 네이티브 SDK 초기화
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - TargetAppProvider
 *
 * [Dependencies]
 * =========
 * - react
 * - ../../../utils/loadConfig (`config.adobe_mobile_app_id`)
 * - ../context/targetContext (`AdobeTargetProvider`)
 * - ../utils/sessionStore (`hydrateSessionStore`)
 * - ../native/adobeMobileTarget (`initAdobeMobileTarget`)
 */

import { useEffect, type ReactNode } from "react";
import { config } from "../../../utils/loadConfig";
import { AdobeTargetProvider } from "../context/targetContext";
import { initAdobeMobileTarget } from "../native/adobeMobileTarget";
import { hydrateSessionStore } from "../utils/sessionStore";

// 1. [Provider] 루트 레이아웃이 트리를 감싼다.
export function TargetAppProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // 웹은 sessionStorage 동기 접근이라 no-op, 네이티브만 AsyncStorage → 메모리 적재
    void hydrateSessionStore();
    // 네이티브 전용: Environment File ID(appId)로 Adobe Mobile SDK 초기화(웹은 no-op)
    void initAdobeMobileTarget(config.adobe_mobile_app_id ?? "");
  }, []);

  return <AdobeTargetProvider>{children}</AdobeTargetProvider>;
}
