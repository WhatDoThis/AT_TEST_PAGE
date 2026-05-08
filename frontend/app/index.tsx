/**
 * app/index.tsx (메인 단일 페이지)
 * ================================================================================
 * 캐러셀·토글·갤러리를 배치하고 캐러셀 인덱스 상태를 단일 소스로 유지한다 (PRD FR-06).
 * Adobe Target 오퍼는 루트 Provider(`targetApp`)에서 채워지며, 본 화면에서는 Context 소비·캐러셀 prop·이벤트 팝업 연결만 한다.
 *
 * [Main Functions]
 * ===========
 * - 홈 화면 UI 조합
 * - 캐러셀·갤러리 인덱스 상태 공유
 * - (AT) event-popup 오퍼 시 EventPopup(마케터 JSON)
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - HomeScreen: index 라우트 기본 화면
 *
 * [Dependencies]
 * =========
 * - react-native
 * - @/components/ImageCarousel (브리지 → targetImageCarousel)
 * - @/components/ToggleButton
 * - @/components/ImageGallery
 * - @/components/CouponTable (웹 전용 쿠폰 테이블)
 * - @/context/AdobeTargetContext (브리지 → adobe_frontend/.../targetContext)
 * - @/components/EventPopup (브리지 → adobe ... EventPopup)
 */

import React, { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import ImageCarousel from "@/components/ImageCarousel";
import ToggleButton from "@/components/ToggleButton";
import ImageGallery from "@/components/ImageGallery";
import CouponTable from "@/components/CouponTable";
import EventPopup from "@/components/EventPopup";

// ════════════════════════════════════════════════════════════════════════════════
// [BRIDGE · Adobe] Context 소비 — 구현: frontend/adobe_frontend/.../context/targetContext.tsx
// ── 임포트 경로 유지용: @/context/AdobeTargetContext (재export 브리지)
// ════════════════════════════════════════════════════════════════════════════════
import { useAdobeTargetEventPopup, useAdobeTargetOffer } from "@/context/AdobeTargetContext";
// ════════════════════════════════════════════════════════════════════════════════
// [BRIDGE · Adobe] 임포트 끝
// ════════════════════════════════════════════════════════════════════════════════

export default function HomeScreen() {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);

  // ── [BRIDGE · Adobe] `_layout` TargetOffersPreload 가 채운 오퍼(없으면 null)
  const adobeOffer = useAdobeTargetOffer();
  const { offer: eventPopupOffer, dismiss: dismissPopup } =
    useAdobeTargetEventPopup();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {/* ════════════════════════════════════════════════════════════════════════
          [BRIDGE · Adobe] ImageCarousel — AT 오퍼 prop 전달(트랙 mbox 등은 캐러셀 내부·loadConfig)
          ════════════════════════════════════════════════════════════════════════ */}
      <ImageCarousel
        currentIndex={carouselIndex}
        onIndexChange={setCarouselIndex}
        adobeOffer={adobeOffer}
      />
      {/* ════════════════════════════════════════════════════════════════════════
          [BRIDGE · Adobe] 끝
          ════════════════════════════════════════════════════════════════════════ */}

      <ToggleButton
        isOpen={galleryOpen}
        onToggle={() => setGalleryOpen((open) => !open)}
      />

      <ImageGallery
        isVisible={galleryOpen}
        selectedIndex={carouselIndex}
        onSelectIndex={setCarouselIndex}
      />

      <CouponTable />

      {/* ── Adobe Target ── event-popup 오퍼 시에만 Modal 표시 */}
      <EventPopup offer={eventPopupOffer} onClose={dismissPopup} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  content: {
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
});
