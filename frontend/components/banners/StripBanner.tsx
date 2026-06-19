/**
 * components/banners/StripBanner.tsx (LGU+ 스타일 띠배너 공용 UI)
 * ================================================================================
 * 상단/하단 띠배너가 함께 쓰는 1줄 띠(strip) 형태의 표시 전용 컴포넌트.
 * LG유플러스 브랜드 마젠타(#E6007E) 기반의 심플한 1줄 메시지 + CTA + 닫기(X) 구성을 따른다.
 * 노출 위치(상/하단)·기본 색은 래퍼(TopBanner/BottomBanner)가 결정하고, 여기서는 그리기만 한다.
 *
 * [Main Functions]
 * ===========
 * - StripBanner: 좌측 텍스트(제목/본문) + 우측 CTA + 닫기(X) 배치
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - StripBanner({ title, body?, ctaText?, onPressCta?, backgroundColor, textColor, accentColor?, onClose? })
 *
 * [Dependencies]
 * =========
 * - react-native (View, Text, Pressable, StyleSheet, Platform)
 */

import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

export interface StripBannerProps {
  title: string;
  body?: string;
  ctaText?: string;
  onPressCta?: () => void;
  backgroundColor: string;
  textColor: string;
  /** CTA 글자색(미지정 시 textColor 사용). 하단 배너처럼 밝은 배경일 때 마젠타 강조에 쓴다. */
  accentColor?: string;
  /** 지정 시 우측에 닫기(X) 버튼을 표시한다. */
  onClose?: () => void;
}

// 1. 1줄 띠배너를 그린다(텍스트 → CTA → 닫기). 표시 전용이며 노출 판단은 래퍼가 한다.
export default function StripBanner({
  title,
  body,
  ctaText,
  onPressCta,
  backgroundColor,
  textColor,
  accentColor,
  onClose,
}: StripBannerProps): React.ReactElement {
  const ctaColor = accentColor ?? textColor;

  return (
    <View style={[s.bar, { backgroundColor }]} accessibilityRole="summary">
      <View style={s.textBox}>
        <Text style={[s.title, { color: textColor }]} numberOfLines={1}>
          {title}
        </Text>
        {body ? (
          <Text style={[s.body, { color: textColor }]} numberOfLines={1}>
            {body}
          </Text>
        ) : null}
      </View>

      {ctaText ? (
        <Pressable
          style={({ pressed }) => [s.cta, pressed && s.ctaPressed]}
          onPress={onPressCta}
          accessibilityRole="button"
          accessibilityLabel={ctaText}
        >
          <Text style={[s.ctaText, { color: ctaColor }]} numberOfLines={1}>
            {ctaText}
          </Text>
        </Pressable>
      ) : null}

      {onClose ? (
        <Pressable
          style={({ pressed }) => [s.close, pressed && s.ctaPressed]}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="배너 닫기"
          hitSlop={8}
        >
          <Text style={[s.closeText, { color: textColor }]}>✕</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 48,
    paddingVertical: 8,
    paddingHorizontal: 16,
    ...(Platform.OS === "web"
      ? { boxShadow: "0px 1px 4px rgba(0,0,0,0.12)" }
      : {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.12,
          shadowRadius: 4,
          elevation: 3,
        }),
  },
  textBox: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
  },
  body: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2,
    opacity: 0.92,
  },
  cta: {
    marginLeft: 12,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  ctaPressed: {
    opacity: 0.6,
  },
  ctaText: {
    fontSize: 13,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  close: {
    marginLeft: 8,
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: {
    fontSize: 16,
    fontWeight: "700",
  },
});
