/**
 * adobe_frontend.target_frontend.app.TargetPageBootstrap (첫 로드 bootstrap — 웹/네이티브 통합)
 * ================================================================================
 * 앱 첫 진입 시 1회 오퍼를 받아 Context(캐러셀·팝업·상/하단 띠배너)에 반영하는 단일 경로.
 * - 웹: DOM 준비 후 `target-ready-mbox`(+배너 mbox) 로 `POST /api/target/offers` 프록시 1회.
 * - 네이티브: Adobe Mobile SDK 로 배너 전용 mbox(`mobile_env.adobe_sdk_mboxes.banner_sdk_mbox_names`) 일괄 조회.
 * 두 경로 모두 동일 `parseAdobeTargetOffersPayload` 로 파싱해 같은 Context·컴포넌트로 표시한다.
 *
 * [Main Functions]
 * ===========
 * - TargetPageBootstrap: 웹=프록시 bootstrap / 네이티브=SDK 배너 mbox 조회 → Context 반영
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - TargetPageBootstrap()
 *
 * [Dependencies]
 * =========
 * - react
 * - react-native Platform
 * - @/utils/loadConfig (config.mobile_env.adobe_sdk_mboxes.banner_sdk_mbox_names)
 * - @adobe-native/native/adobeMobileTarget (retrieveTargetContents — 웹은 no-op)
 * - ../context/targetContext
 * - ../utils/targetOfferParser
 * - ../utils/targetOffersFetch
 */

import { useEffect } from "react";
import { Platform } from "react-native";
import { config } from "@/utils/loadConfig";
import { retrieveTargetContents } from "@adobe-native/native/adobeMobileTarget";
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
    let cancelled = false;

    // [네이티브] Mobile SDK 로 배너 전용 mbox 들을 일괄 조회 → 웹과 동일 파서로 상/하단 배너만 반영.
    //  (캐러셀·event-popup 은 네이티브에서 각 화면이 별도 처리하므로 여기선 배너만 채운다)
    if (Platform.OS !== "web") {
      const bannerMboxes =
        config.mobile_env?.adobe_sdk_mboxes?.banner_sdk_mbox_names ?? [];
      retrieveTargetContents(bannerMboxes)
        .then((items) => {
          if (cancelled) {
            return;
          }
          // 네이티브 mbox별 콘텐츠 문자열을 웹 `{ offers: [...] }` 모양으로 감싸 동일 파서 재사용.
          const offers = items.map((it) => ({ content: it.content }));
          const { topBanner, bottomBanner } = parseAdobeTargetOffersPayload({
            offers,
          });
          setTopBannerOffer(topBanner);
          setBottomBannerOffer(bottomBanner);
        })
        .catch((err) =>
          console.warn("[AT] TargetPageBootstrap(native) fail:", err),
        )
        .finally(() => {
          if (!cancelled) {
            setBannersReady(true);
          }
        });
      return () => {
        cancelled = true;
      };
    }

    // [웹·SSR] DOM 이 없으면(prerender) 즉시 ready 처리.
    if (typeof document === "undefined") {
      setBannersReady(true);
      return;
    }

    // [웹] DOM 준비 후 백엔드 프록시 bootstrap 1회.
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
