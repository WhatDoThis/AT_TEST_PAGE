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
 * - @/utils/loadConfig (`frontend/env/config.{dev|prd}.json`)
 * - ../context/targetContext
 * - ../utils/targetOffersFetch (`fetchAdobeTargetOffersResponse`)
 */

import { useEffect, type ReactNode } from "react";
import { Platform } from "react-native";
import {
  AdobeTargetProvider,
  useAdobeTargetSetEventPopupOffer,
  useAdobeTargetSetOffer,
} from "../context/targetContext";
import { parseAdobeTargetOffersPayload } from "../utils/targetOfferParser";
import { fetchAdobeTargetOffersResponse } from "../utils/targetOffersFetch";

// 1. [Provider] 루트 레이아웃이 트리를 감싼다.
export function TargetAppProvider({ children }: { children: ReactNode }) {
  return <AdobeTargetProvider>{children}</AdobeTargetProvider>;
}

// 2. [프리로드] 웹 전용 — offers 응답을 Context·sessionStorage에 반영한다.
export function TargetOffersPreload() {
  const setAdobeTargetOffer = useAdobeTargetSetOffer();
  const setEventPopupOffer = useAdobeTargetSetEventPopupOffer();

  useEffect(() => {
    if (Platform.OS !== "web") return;

    fetchAdobeTargetOffersResponse()
      .then(({ ok, status, data }) => {
        if (!ok) {
          console.warn("[AT] offers HTTP fail:", status, data);
          return;
        }
        const { carousel, eventPopup } = parseAdobeTargetOffersPayload(data);
        setAdobeTargetOffer(carousel);
        setEventPopupOffer(eventPopup);
        if (eventPopup !== null) {
          // ── Adobe Target ──
          console.log("[Adobe Target] event-popup offer received", eventPopup);
        }
        console.log("[Adobe Target] offers loaded:", {
          carousel,
          eventPopup,
          raw: data,
        });
      })
      .catch((err) => console.warn("[AT] offers fetch fail:", err));
  }, [setAdobeTargetOffer, setEventPopupOffer]);

  return null;
}
