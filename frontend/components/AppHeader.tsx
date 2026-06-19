/**
 * components/AppHeader.tsx (전역 상단 앱 네임 라벨 바)
 * ================================================================================
 * 모든 화면 최상단에 고정되는 앱 타이틀(앱 네임 라벨) 헤더.
 * 기존 Expo Router Stack 기본 헤더와 동일한 모양(파란 바·가운데 흰색 굵은 타이틀)을 유지하되,
 * 헤더 "바로 아래" 에 상단 띠배너를 끼워 넣을 수 있도록 레이아웃 단으로 분리했다.
 * (Stack 은 `headerShown:false`, 이 컴포넌트가 헤더 역할을 대신한다.)
 *
 * [Main Functions]
 * ===========
 * - AppHeader: 상단 safe-area inset + 파란 바 + 가운데 앱 타이틀
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - AppHeader(): React.ReactElement
 *
 * [Dependencies]
 * =========
 * - react-native (View, Text, StyleSheet)
 * - react-native-safe-area-context (useSafeAreaInsets)
 * - @/utils/loadConfig (app_title)
 */

import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { config } from "@/utils/loadConfig";

/** 기존 Stack 기본 헤더와 동일한 컬러/타이포(파란 바·흰색 굵은 타이틀). */
const HEADER_BG = "#4A90D9";
const HEADER_HEIGHT = 56;

// 1. 상단 상태바 영역(inset)을 파란색으로 덮고, 그 아래 고정 높이 바에 앱 타이틀을 가운데 표시한다.
export default function AppHeader(): React.ReactElement {
  const insets = useSafeAreaInsets();

  return (
    <View style={[s.header, { paddingTop: insets.top }]}>
      <View style={s.bar}>
        <Text style={s.title} numberOfLines={1} accessibilityRole="header">
          {config.app_title}
        </Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    backgroundColor: HEADER_BG,
  },
  bar: {
    height: HEADER_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  title: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 20,
  },
});
