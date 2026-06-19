/**
 * components/banners/BottomBanner.tsx (하단 고정 띠배너 — 푸터 바로 위)
 * ================================================================================
 * 전역 하단 푸터 "바로 위" 에 노출되는 LGU+ 스타일 하단 띠배너.
 * Adobe Target 의 `type: bottom-banner` 오퍼를 소비하며, 오퍼가 없으면 위치 확인용 기본 문구만 표시한다.
 * 밝은 배경 + 마젠타 강조 CTA 로 상단(마젠타 바) 띠배너와 시각적으로 구분한다.
 *
 * [Main Functions]
 * ===========
 * - BottomBanner: Context 의 하단 띠배너 오퍼 → StripBanner 렌더(없으면 기본값)
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - BottomBanner(): React.ReactElement | null
 *
 * [Dependencies]
 * =========
 * - react-native (Linking, View, StyleSheet)
 * - @/context/AdobeTargetContext (useAdobeTargetBottomBanner)
 * - ./StripBanner
 */

import React, { useState } from "react";
import { Linking, StyleSheet, View } from "react-native";
import { useAdobeTargetBottomBanner } from "@/context/AdobeTargetContext";
import StripBanner from "./StripBanner";

/** 오퍼 미지정 시 보여줄 기본값(위치 확인용). 밝은 배경 + 마젠타 강조 CTA. */
const DEFAULT_TITLE = "하단 띠배너 위치";
const DEFAULT_BG = "#FFFFFF";
const DEFAULT_TEXT = "#1A1A2E";
const ACCENT = "#E6007E";

// 1. 하단 띠배너: Target 하단 배너 오퍼를 읽어 푸터 위에 StripBanner 로 그린다. 닫으면 세션 동안 숨김.
export default function BottomBanner(): React.ReactElement | null {
  const offer = useAdobeTargetBottomBanner();
  const [closed, setClosed] = useState(false);

  if (closed) {
    return null;
  }

  const title = offer?.title?.trim() ? offer.title : DEFAULT_TITLE;
  const ctaUrl = offer?.ctaUrl?.trim() ? offer.ctaUrl : undefined;
  const onPressCta = ctaUrl
    ? () => {
        Linking.openURL(ctaUrl).catch((err) =>
          console.warn("[Banner] bottom CTA open fail:", err),
        );
      }
    : undefined;

  return (
    <View style={s.wrap}>
      <StripBanner
        title={title}
        body={offer?.body}
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
