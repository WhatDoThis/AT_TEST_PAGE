/**
 * components/banners/BottomBanner.tsx (하단 고정 띠배너 — 푸터 바로 위)
 * ================================================================================
 * 전역 하단 푸터 "바로 위" 에 노출되는 LGU+ 스타일 하단 띠배너.
 * Adobe Target 의 `type: bottom-banner` 오퍼를 소비하며, 오퍼가 없으면 위치 확인용 기본 문구만 표시한다.
 * 밝은 배경 + 마젠타 강조 CTA 로 상단(마젠타 바) 띠배너와 시각적으로 구분한다.
 * 오퍼에 `endAt` 이 있으면 카운트다운(남은시간)을 본문에 노출하고, 만료 시 `expiredTitle` 로 교체한다.
 *
 * [Main Functions]
 * ===========
 * - BottomBanner: Context 의 하단 띠배너 오퍼 + 카운트다운 → StripBanner 렌더(없으면 기본값)
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - BottomBanner(): React.ReactElement | null
 *
 * [Dependencies]
 * =========
 * - react-native (View, StyleSheet)
 * - @/context/AdobeTargetContext (useAdobeTargetBottomBanner)
 * - ./StripBanner
 * - ./useCountdown
 * - ./openBannerCta
 */

import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useAdobeTargetBottomBanner } from "@/context/AdobeTargetContext";
import StripBanner from "./StripBanner";
import { useCountdown } from "./useCountdown";
import { openBannerCta } from "./openBannerCta";

/** 오퍼 미지정 시 보여줄 기본값(위치 확인용). 밝은 배경 + 마젠타 강조 CTA. */
const DEFAULT_TITLE = "하단 띠배너 위치";
const DEFAULT_BG = "#FFFFFF";
const DEFAULT_TEXT = "#1A1A2E";
const ACCENT = "#E6007E";

// 1. 하단 띠배너: Target 하단 배너 오퍼 + 카운트다운을 읽어 푸터 위에 StripBanner 로 그린다. 닫으면 세션 동안 숨김.
export default function BottomBanner(): React.ReactElement | null {
  const offer = useAdobeTargetBottomBanner();
  const { label, active, expired } = useCountdown(offer?.endAt);
  const [closed, setClosed] = useState(false);

  if (closed) {
    return null;
  }

  const baseTitle = offer?.title?.trim() ? offer.title : DEFAULT_TITLE;
  // 만료 시 expiredTitle 우선, 진행 중에는 promo title 유지
  const title =
    expired && offer?.expiredTitle?.trim() ? offer.expiredTitle : baseTitle;
  // 진행 중이면 남은시간을 본문 줄에 노출, 그 외엔 기존 body
  const body = active && label ? `${label} 남음` : offer?.body;
  const ctaUrl = offer?.ctaUrl?.trim() ? offer.ctaUrl : undefined;
  const onPressCta = ctaUrl
    ? () => openBannerCta(ctaUrl, offer?.ctaTarget)
    : undefined;

  return (
    <View style={s.wrap}>
      <StripBanner
        title={title}
        body={body}
        ctaText={offer?.ctaText}
        onPressCta={onPressCta}
        backgroundColor={offer?.backgroundColor ?? DEFAULT_BG}
        textColor={offer?.textColor ?? DEFAULT_TEXT}
        accentColor={ACCENT}
        onClose={() => setClosed(true)}
      />
    </View>
  );
}

const s = StyleSheet.create({
  // 본문 영역과 구분되도록 상단 헤어라인을 둔다(푸터와는 BottomBanner 가 푸터 위에 위치).
  wrap: {
    borderTopWidth: 1,
    borderTopColor: "#F0DCE7",
  },
});
