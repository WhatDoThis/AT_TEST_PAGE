/**
 * adobe_frontend.target_frontend.components.targetImageCarousel (메인 이미지 캐러셀 + AT)
 * ================================================================================
 * 우측에서 다음 이미지가 들어오고 현재 이미지가 좌측으로 퇴장하는 전환을 제공한다.
 * Adobe Target 오퍼(`adobeOffer`)가 전달되면 버튼 텍스트·자동 재생 주기를 오퍼 값으로 덮어쓴다.
 *
 * [Main Functions]
 * ===========
 * - 다음 이미지 애니메이션 전환
 * - 인덱스 변경 시 레이아웃 리셋(외부 동기화)
 * - (AT) Adobe Target 오퍼 기반 버튼 텍스트 / 자동 재생(autoPlayMs) 적용
 * - // ── Adobe Target ── 다음 이미지 클릭 시 offers-only 흐름 유지(트래킹 호출 제거)
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - ImageCarousel: currentIndex, onIndexChange, adobeOffer props
 *
 * [Dependencies]
 * =========
 * - react-native
 * - react-native-reanimated
 * - @/utils/loadConfig (frontend/env/config.{dev|prd}.json)
 * - @/utils/imageMap
 * - ../context/targetContext
 */

import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Image,
  StyleSheet,
  Pressable,
  Text,
  useWindowDimensions,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import { config } from "@/utils/loadConfig";
import { getImage } from "@/utils/imageMap";

import type { AdobeTargetOffer } from "../utils/targetOfferParser";

const DEFAULT_NEXT_BUTTON_TEXT = "▶ 다음 이미지";
const ANIM_DURATION = 300;

export interface ImageCarouselProps {
  currentIndex: number;
  onIndexChange: (index: number) => void;
  adobeOffer?: AdobeTargetOffer | null;
}

// 1. 이미지가 없으면 안내 UI만 표시한다.
export default function ImageCarousel({
  currentIndex,
  onIndexChange,
  adobeOffer,
}: ImageCarouselProps) {
  const { width } = useWindowDimensions();
  const imageWidth = Math.min(width - 40, 500);
  const imageHeight = imageWidth * 0.65;
  const images = config.images;
  const len = images.length;

  const [isAnimating, setIsAnimating] = useState(false);

  const currentTranslateX = useSharedValue(0);
  const currentOpacity = useSharedValue(1);
  const nextTranslateX = useSharedValue(-imageWidth);
  const nextOpacity = useSharedValue(0);

  const currentStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: currentTranslateX.value }],
    opacity: currentOpacity.value,
  }));

  const nextStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: nextTranslateX.value }],
    opacity: nextOpacity.value,
  }));

  useEffect(() => {
    currentTranslateX.value = 0;
    currentOpacity.value = 1;
    nextTranslateX.value = -imageWidth;
    nextOpacity.value = 0;
    setIsAnimating(false);
  }, [currentIndex, imageWidth]);

  const finalizeNext = useCallback(
    (newIndex: number) => {
      currentTranslateX.value = 0;
      currentOpacity.value = 1;
      nextTranslateX.value = -imageWidth;
      nextOpacity.value = 0;
      setIsAnimating(false);
      onIndexChange(newIndex);
    },
    [imageWidth, onIndexChange],
  );

  const goNext = useCallback(() => {
    if (len === 0) {
      return;
    }
    if (isAnimating) {
      return;
    }

    setIsAnimating(true);
    const newIndex = (currentIndex + 1) % len;

    nextOpacity.value = 1;
    nextTranslateX.value = imageWidth;

    currentTranslateX.value = withTiming(-imageWidth, {
      duration: ANIM_DURATION,
      easing: Easing.inOut(Easing.ease),
    });

    nextTranslateX.value = withTiming(
      0,
      {
        duration: ANIM_DURATION,
        easing: Easing.inOut(Easing.ease),
      },
      (finished) => {
        if (finished) {
          runOnJS(finalizeNext)(newIndex);
        } else {
          runOnJS(setIsAnimating)(false);
        }
      },
    );
  }, [currentIndex, finalizeNext, imageWidth, isAnimating, len]);

  useEffect(() => {
    const ms = adobeOffer?.autoPlayMs;
    if (!ms || ms <= 0) {
      if (adobeOffer) {
        console.log(
          "[Adobe Target] autoPlay disabled (autoPlayMs=",
          ms,
          ", offer=",
          adobeOffer,
          ")",
        );
      }
      return;
    }
    console.log("[Adobe Target] autoPlay enabled:", ms, "ms");
    const timer = setInterval(() => {
      if (!isAnimating) {
        goNext();
      }
    }, ms);
    return () => clearInterval(timer);
  }, [adobeOffer?.autoPlayMs, adobeOffer, isAnimating, goNext]);

  if (len === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>config.json에 images 항목이 없습니다.</Text>
      </View>
    );
  }

  const safeIndex = Math.min(Math.max(currentIndex, 0), len - 1);
  const incomingIndex = (safeIndex + 1) % len;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.imageWrapper,
          { width: imageWidth, height: imageHeight },
        ]}
      >
        <Animated.View style={[styles.imageAbsolute, currentStyle]}>
          <Image
            source={getImage(images[safeIndex].filename)}
            style={[styles.image, { width: imageWidth, height: imageHeight }]}
            resizeMode="cover"
          />
        </Animated.View>

        <Animated.View style={[styles.imageAbsolute, nextStyle]}>
          <Image
            source={getImage(images[incomingIndex].filename)}
            style={[styles.image, { width: imageWidth, height: imageHeight }]}
            resizeMode="cover"
          />
        </Animated.View>
      </View>

      <View style={styles.indicator}>
        {images.map((_, i) => (
          <View
            key={`dot-${String(i)}`}
            style={[styles.dot, i === safeIndex && styles.dotActive]}
          />
        ))}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="다음 이미지로 이동"
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
        onPress={goNext}
      >
        <Text style={styles.buttonText}>
          {adobeOffer?.buttonText ?? DEFAULT_NEXT_BUTTON_TEXT}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginTop: 16,
  },
  imageWrapper: {
    overflow: "hidden",
    borderRadius: 12,
    backgroundColor: "#e0e0e0",
    position: "relative",
  },
  imageAbsolute: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  image: {
    borderRadius: 12,
  },
  indicator: {
    flexDirection: "row",
    marginTop: 12,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ccc",
  },
  dotActive: {
    backgroundColor: "#4A90D9",
    width: 24,
  },
  button: {
    marginTop: 16,
    backgroundColor: "#4A90D9",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  empty: {
    padding: 24,
    alignItems: "center",
  },
  emptyText: {
    color: "#666",
    fontSize: 14,
  },
});
