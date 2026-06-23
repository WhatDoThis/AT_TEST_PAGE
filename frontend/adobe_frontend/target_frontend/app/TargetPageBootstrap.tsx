/**
 * adobe_frontend.target_frontend.app.TargetPageBootstrap (웹 첫 로드 bootstrap mbox)
 * ================================================================================
 * 웹에서 DOM 준비 후 `target-ready-mbox`(설정 `bootstrap_mbox_name`)로 `POST /api/target/offers` 1회를 유도한다.
 * Python SDK 프록시 응답을 `parseAdobeTargetOffersPayload`로 Context에 수동 반영한다.
 *
 * [Main Functions]
 * ===========
 * - TargetPageBootstrap: DOM 준비 + bootstrap mbox offers(웹 전용)
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - TargetPageBootstrap()
 *
 * [Dependencies]
 * =========
 * - react
 * - react-native Platform
 * - ../context/targetContext
 * - ../utils/targetOfferParser
 * - ../utils/targetOffersFetch
 */

import { useEffect } from "react";
import { Platform } from "react-native";
import {
  useAdobeTargetSetBannersReady,
  useAdobeTargetSetBottomBanner,
  useAdobeTargetSetEventPopupOffer,
  useAdobeTargetSetOffer,
  useAdobeTargetSetTopBanner,
} from "../context/targetContext";
import { parseAdobeTargetOffersPayload } from "../utils/targetOfferParser";
import { fetchAdobeTargetOffersResponseDeduped } from "../utils/targetOffersFetch";

function _whenDomReady(run: () => void): void {
  if (typeof document === "undefined") {
    return;
  }
  if (document.readyState === "complete" || document.readyState === "interactive") {
    requestAnimationFrame(run);
    return;
  }
  const onReady = () => {
    document.removeEventListener("DOMContentLoaded", onReady);
    requestAnimationFrame(run);
  };
  document.addEventListener("DOMContentLoaded", onReady);
}

// 1. Provider 트리 안에서만 사용한다.
export function TargetPageBootstrap() {
  const setOffer = useAdobeTargetSetOffer();
  const setEventPopupOffer = useAdobeTargetSetEventPopupOffer();
  const setTopBannerOffer = useAdobeTargetSetTopBanner();
  const setBottomBannerOffer = useAdobeTargetSetBottomBanner();
  const setBannersReady = useAdobeTargetSetBannersReady();

  useEffect(() => {
    // 네이티브/SSR 등 부트스트랩이 없는 경로는 즉시 ready 처리(기본 문구 노출 유지).
    if (Platform.OS !== "web" || typeof document === "undefined") {
      setBannersReady(true);
      return;
    }
    let cancelled = false;
    _whenDomReady(() => {
      if (cancelled) {
        return;
      }
      fetchAdobeTargetOffersResponseDeduped({ bootstrap: true })
        .then(({ ok, status, data }) => {
          if (cancelled) {
            return;
          }
          if (!ok) {
            console.warn("[AT] TargetPageBootstrap HTTP fail:", status);
            return;
          }
          const { carousel, eventPopup, topBanner, bottomBanner } =
            parseAdobeTargetOffersPayload(data);
          setOffer(carousel);
          setEventPopupOffer(eventPopup);
          setTopBannerOffer(topBanner);
          setBottomBannerOffer(bottomBanner);
        })
        .catch((err) => console.warn("[AT] TargetPageBootstrap fetch fail:", err))
        // 성공·실패 무관하게 부트스트랩이 끝나면 배너 렌더를 허용한다(완료 전 깜빡임 방지).
        .finally(() => {
          if (!cancelled) {
            setBannersReady(true);
          }
        });
    });
    return () => {
      cancelled = true;
    };
  }, [
    setOffer,
    setEventPopupOffer,
    setTopBannerOffer,
    setBottomBannerOffer,
    setBannersReady,
  ]);

  return null;
}
