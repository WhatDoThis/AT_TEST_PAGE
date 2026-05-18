/**
 * adobe_frontend.target_frontend.app.targetApp (Adobe Target 루트 Provider)
 * ================================================================================
 * Expo Router 루트에서 `AdobeTargetProvider` 만 주입한다.
 * offers 호출·Context 반영은 `TargetPageBootstrap` 단일 경로에서 수행한다.
 *
 * [Main Functions]
 * ===========
 * - TargetAppProvider: AdobeTargetProvider 래핑
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - TargetAppProvider
 *
 * [Dependencies]
 * =========
 * - react
 * - ../context/targetContext (`AdobeTargetProvider`)
 */

import type { ReactNode } from "react";
import { AdobeTargetProvider } from "../context/targetContext";

// 1. [Provider] 루트 레이아웃이 트리를 감싼다.
export function TargetAppProvider({ children }: { children: ReactNode }) {
  return <AdobeTargetProvider>{children}</AdobeTargetProvider>;
}
