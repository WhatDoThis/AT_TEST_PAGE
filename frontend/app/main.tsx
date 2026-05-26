/**
 * app/main.tsx (메인 화면 — /at-test/main)
 * ================================================================================
 * 캐러셀·토글·갤러리를 배치하고 캐러셀 인덱스 상태를 단일 소스로 유지한다 (PRD FR-06).
 * Adobe Target 오퍼는 `TargetPageBootstrap`이 채운 Context를 소비한다.
 *
 * [Main Functions]
 * ===========
 * - 홈 화면 UI 조합
 * - 캐러셀·갤러리 인덱스 상태 공유
 * - (AT) event-popup 오퍼 시 EventPopup
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - MainScreen: /main 라우트 화면
 *
 * [Dependencies]
 * =========
 * - react-native
 * - @/components/ImageCarousel, ToggleButton, ImageGallery, CouponTable, EventPopup
 * - @/context/AdobeTargetContext
 */

import React, { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import ImageCarousel from "@/components/ImageCarousel";
import ToggleButton from "@/components/ToggleButton";
import ImageGallery from "@/components/ImageGallery";
import CouponTable from "@/components/CouponTable";
import EventPopup from "@/components/EventPopup";
import { useAdobeTargetEventPopup, useAdobeTargetOffer } from "@/context/AdobeTargetContext";

export default function MainScreen() {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const adobeOffer = useAdobeTargetOffer();
  const { offer: eventPopupOffer, dismiss: dismissPopup } =
    useAdobeTargetEventPopup();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <ImageCarousel
        currentIndex={carouselIndex}
        onIndexChange={setCarouselIndex}
        adobeOffer={adobeOffer}
      />

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
