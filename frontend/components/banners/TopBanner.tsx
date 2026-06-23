/**
 * components/banners/TopBanner.tsx (상단 고정 띠배너 — 앱 네임 라벨 바로 아래)
 * ================================================================================
 * 앱 헤더(앱 네임 라벨) 바로 아래에 노출되는 LGU+ 스타일 상단 띠배너.
 * Adobe Target 의 `type: top-banner` 오퍼를 소비하며, 오퍼가 없으면 위치 확인용 기본 문구만 표시한다.
 * 노출/내용 결정은 Target 오퍼가 하고, 닫기(X) 는 같은 세션 동안만 숨긴다.
 * 오퍼에 `endAt` 이 있으면 카운트다운(남은시간)을 본문에 노출하고, 만료 시 `expiredTitle` 로 교체한다.
 *
 * [Main Functions]
 * ===========
 * - TopBanner: Context 의 상단 띠배너 오퍼 + 카운트다운 → StripBanner 렌더(없으면 기본값)
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - TopBanner(): React.ReactElement | null
 *
 * [Dependencies]
 * =========
 * - @/context/AdobeTargetContext (useAdobeTargetTopBanner, useAdobeTargetBannersReady)
 * - ./StripBanner
 * - ./useCountdown
 * - ./openBannerCta
 */

import React, { useState } from "react";
import {
  useAdobeTargetBannersReady,
  useAdobeTargetTopBanner,
} from "@/context/AdobeTargetContext";
import StripBanner from "./StripBanner";
import { useCountdown } from "./useCountdown";
import { openBannerCta } from "./openBannerCta";

/** 오퍼 미지정 시 보여줄 기본값(위치 확인용). LGU+ 마젠타 + 흰색 텍스트. */
const DEFAULT_TITLE = "상단 띠배너 위치";
const DEFAULT_BG = "#E6007E";
const DEFAULT_TEXT = "#FFFFFF";

// 1. 상단 띠배너: Target 상단 배너 오퍼 + 카운트다운을 읽어 StripBanner 로 그린다. 닫으면 세션 동안 숨김.
export default function TopBanner(): React.ReactElement | null {
  const offer = useAdobeTargetTopBanner();
  const ready = useAdobeTargetBannersReady();
  const { label, active, expired } = useCountdown(offer?.endAt);
  const [closed, setClosed] = useState(false);

  // 부트스트랩 완료 전엔 렌더 안 함 → 기본문구→오퍼 깜빡임 방지. 닫으면 세션 동안 숨김.
  if (!ready || closed) {
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
    <StripBanner
      title={title}
      body={body}
      ctaText={offer?.ctaText}
      onPressCta={onPressCta}
      backgroundColor={offer?.backgroundColor ?? DEFAULT_BG}
      textColor={offer?.textColor ?? DEFAULT_TEXT}
      onClose={() => setClosed(true)}
    />
  );
}
