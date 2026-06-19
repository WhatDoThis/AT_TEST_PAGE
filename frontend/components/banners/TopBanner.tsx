/**
 * components/banners/TopBanner.tsx (상단 고정 띠배너 — 앱 네임 라벨 바로 아래)
 * ================================================================================
 * 앱 헤더(앱 네임 라벨) 바로 아래에 노출되는 LGU+ 스타일 상단 띠배너.
 * Adobe Target 의 `type: top-banner` 오퍼를 소비하며, 오퍼가 없으면 위치 확인용 기본 문구만 표시한다.
 * 노출/내용 결정은 Target 오퍼가 하고, 닫기(X) 는 같은 세션 동안만 숨긴다.
 *
 * [Main Functions]
 * ===========
 * - TopBanner: Context 의 상단 띠배너 오퍼 → StripBanner 렌더(없으면 기본값)
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - TopBanner(): React.ReactElement | null
 *
 * [Dependencies]
 * =========
 * - react-native (Linking)
 * - @/context/AdobeTargetContext (useAdobeTargetTopBanner)
 * - ./StripBanner
 */

import React, { useState } from "react";
import { Linking } from "react-native";
import { useAdobeTargetTopBanner } from "@/context/AdobeTargetContext";
import StripBanner from "./StripBanner";

/** 오퍼 미지정 시 보여줄 기본값(위치 확인용). LGU+ 마젠타 + 흰색 텍스트. */
const DEFAULT_TITLE = "상단 띠배너 위치";
const DEFAULT_BG = "#E6007E";
const DEFAULT_TEXT = "#FFFFFF";

// 1. 상단 띠배너: Target 상단 배너 오퍼를 읽어 StripBanner 로 그린다. 닫으면 세션 동안 숨김.
export default function TopBanner(): React.ReactElement | null {
  const offer = useAdobeTargetTopBanner();
  const [closed, setClosed] = useState(false);

  if (closed) {
    return null;
  }

  const title = offer?.title?.trim() ? offer.title : DEFAULT_TITLE;
  const ctaUrl = offer?.ctaUrl?.trim() ? offer.ctaUrl : undefined;
  const onPressCta = ctaUrl
    ? () => {
        Linking.openURL(ctaUrl).catch((err) =>
          console.warn("[Banner] top CTA open fail:", err),
        );
      }
    : undefined;

  return (
    <StripBanner
      title={title}
      body={offer?.body}
      ctaText={offer?.ctaText}
      onPressCta={onPressCta}
      backgroundColor={offer?.backgroundColor ?? DEFAULT_BG}
      textColor={offer?.textColor ?? DEFAULT_TEXT}
      onClose={() => setClosed(true)}
    />
  );
}
