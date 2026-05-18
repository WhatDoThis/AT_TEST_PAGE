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
  useAdobeTargetSetEventPopupOffer,
  useAdobeTargetSetOffer,
} from "../context/targetContext";
import { parseAdobeTargetOffersPayload } from "../utils/targetOfferParser";
import {
  fetchAdobeTargetOffersResponseDeduped,
  getAdobeBootstrapMboxNameForFetch,
} from "../utils/targetOffersFetch";

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

  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") {
      return;
    }
    let cancelled = false;
    const bootstrapMbox = getAdobeBootstrapMboxNameForFetch();
    _whenDomReady(() => {
      if (cancelled) {
        return;
      }
      fetchAdobeTargetOffersResponseDeduped({ mboxName: bootstrapMbox })
        .then(({ ok, status, data }) => {
          if (cancelled) {
            return;
          }
          if (!ok) {
            console.warn("[AT] TargetPageBootstrap HTTP fail:", status);
            return;
          }
          const { carousel, eventPopup } = parseAdobeTargetOffersPayload(data);
          setOffer(carousel);
          setEventPopupOffer(eventPopup);
        })
        .catch((err) => console.warn("[AT] TargetPageBootstrap fetch fail:", err));
    });
    return () => {
      cancelled = true;
    };
  }, [setOffer, setEventPopupOffer]);

  return null;
}
