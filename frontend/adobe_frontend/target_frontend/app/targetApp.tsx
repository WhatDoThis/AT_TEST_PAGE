/**
 * adobe_frontend.target_frontend.app.targetApp (Adobe Target 루트 통합)
 * ================================================================================
 * Expo Router 루트에서 사용할 Provider·오퍼 프리로드 컴포넌트를 한 모듈로 묶는다.
 *
 * [Main Functions]
 * ===========
 * - TargetAppProvider: AdobeTargetProvider 래핑(동일 동작)
 * - TargetOffersPreload: 웹에서 POST /api/target/offers 후 Context에 오퍼 저장
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - TargetAppProvider, TargetOffersPreload
 *
 * [Dependencies]
 * =========
 * - react
 * - react-native Platform
 * - @/utils/loadConfig (`frontend/env/config.{dev|prd}.json` + `frontend/env/config.adobe.json` 병합)
 * - ../context/targetContext
 * - ../utils/targetSession
 */

import { useEffect, type ReactNode } from "react";
import { Platform } from "react-native";
import { config } from "@/utils/loadConfig";
import {
  AT_TNT_STORAGE_KEY,
  AT_VISITOR_STORAGE_KEY,
  getAdobeTargetVisitorPayload,
} from "../utils/targetSession";
import {
  AdobeTargetProvider,
  parseAdobeTargetOffer,
  useAdobeTargetSetOffer,
} from "../context/targetContext";

const API_BASE_URL = config.api_base_url ?? config.api_url ?? "http://localhost:8010";

// 1. [Provider] 루트 레이아웃이 트리를 감싼다.
export function TargetAppProvider({ children }: { children: ReactNode }) {
  return <AdobeTargetProvider>{children}</AdobeTargetProvider>;
}

// 2. [프리로드] 웹 전용 — offers 응답을 Context·sessionStorage에 반영한다.
//    `mbox_name` 출처: frontend/env/config.adobe.json → `@/utils/loadConfig` → `config.adobe_target.offer_mbox_name`
export function TargetOffersPreload() {
  const setAdobeTargetOffer = useAdobeTargetSetOffer();

  useEffect(() => {
    if (Platform.OS !== "web") return;

    fetch(`${API_BASE_URL}/api/target/offers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mbox_name: config.adobe_target.offer_mbox_name,
        ...(typeof window !== "undefined" && window.location?.href
          ? { page_url: window.location.href }
          : {}),
        ...getAdobeTargetVisitorPayload(),
      }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          console.warn("[Adobe Target] offers HTTP error:", res.status, data);
          return;
        }
        if (typeof sessionStorage !== "undefined") {
          if (typeof data?.tnt_id === "string" && data.tnt_id) {
            sessionStorage.setItem(AT_TNT_STORAGE_KEY, data.tnt_id);
          }
          if (typeof data?.visitor_third_party_id === "string" && data.visitor_third_party_id) {
            sessionStorage.setItem(AT_VISITOR_STORAGE_KEY, data.visitor_third_party_id);
          }
        }
        const offer = parseAdobeTargetOffer(data);
        setAdobeTargetOffer(offer);
        console.log("[Adobe Target] offers loaded:", { offer, raw: data });
      })
      .catch((err) => console.warn("[Adobe Target] offers fetch failed:", err));
  }, [setAdobeTargetOffer]);

  return null;
}
