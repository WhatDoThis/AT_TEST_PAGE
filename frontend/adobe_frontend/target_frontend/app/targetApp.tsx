/**
 * adobe_frontend.target_frontend.app.targetApp (Adobe Target 루트 Provider)
 * ================================================================================
 * Expo Router 루트에서 `AdobeTargetProvider` 만 주입한다.
 * offers 호출·Context 반영은 `TargetPageBootstrap` 단일 경로에서 수행한다.
 * 마운트 시 `hydrateSessionStore()`로 (네이티브) 세션 저장소를 메모리 캐시에 1회 적재한다.
 *
 * [Main Functions]
 * ===========
 * - TargetAppProvider: AdobeTargetProvider 래핑 + 세션 저장소 hydrate
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - TargetAppProvider
 *
 * [Dependencies]
 * =========
 * - react
 * - ../context/targetContext (`AdobeTargetProvider`)
 * - ../utils/sessionStore (`hydrateSessionStore`)
 */

import { useEffect, type ReactNode } from "react";
import { AdobeTargetProvider } from "../context/targetContext";
import { hydrateSessionStore } from "../utils/sessionStore";

// 1. [Provider] 루트 레이아웃이 트리를 감싼다.
export function TargetAppProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // 웹은 sessionStorage 동기 접근이라 no-op, 네이티브만 AsyncStorage → 메모리 적재
    void hydrateSessionStore();
  }, []);

  return <AdobeTargetProvider>{children}</AdobeTargetProvider>;
}
