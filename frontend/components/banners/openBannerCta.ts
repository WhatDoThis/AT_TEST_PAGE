/**
 * components/banners/openBannerCta.ts (띠배너 CTA 열기 공용 함수)
 * ================================================================================
 * 상/하단 띠배너 CTA 클릭 시 URL 을 여는 단일 진입점.
 * 웹은 `ctaTarget` 으로 현재창/새창을 선택하고, 네이티브는 외부 브라우저로 연다(타깃 개념 없음).
 *   - "_self"  : 현재창에서 이동(window.location.assign)
 *   - "_blank" : 새 탭(window.open, noopener) — 미지정 시 기본값
 *
 * [Main Functions]
 * ===========
 * - openBannerCta: ctaUrl + ctaTarget 로 URL 열기(웹 현재창/새창, 네이티브 외부 브라우저)
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - openBannerCta(url, target?): void
 *
 * [Dependencies]
 * =========
 * - react-native (Linking, Platform)
 */

import { Linking, Platform } from "react-native";

export type BannerCtaTarget = "_self" | "_blank";

// 1. CTA URL 을 연다. 웹은 target(_self/_blank)에 따라, 네이티브는 외부 브라우저로.
export function openBannerCta(url: string, target?: string): void {
  if (Platform.OS !== "web" || typeof window === "undefined") {
    Linking.openURL(url).catch((err) =>
      console.warn("[Banner] CTA open fail:", err),
    );
    return;
  }
  if (_normalizeTarget(target) === "_self") {
    window.location.assign(url);
    return;
  }
  window.open(url, "_blank", "noopener,noreferrer");
}

// 2. "_self" 만 현재창, 그 외(미지정 포함)는 새창 기본.
function _normalizeTarget(target?: string): BannerCtaTarget {
  return target?.trim() === "_self" ? "_self" : "_blank";
}
