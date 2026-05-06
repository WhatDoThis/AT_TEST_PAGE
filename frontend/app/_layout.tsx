/**
 * app/_layout.tsx (Expo Router 루트 레이아웃)
 * ================================================================================
 * Stack 네비게이션과 공통 헤더(앱 타이틀)를 적용한다. 제스처 루트로 하위 화면을 감싼다.
 *
 * [Main Functions]
 * ===========
 * - Stack screenOptions로 헤더 스타일 구성
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - RootLayout: 기본 export 레이아웃
 *
 * [Dependencies]
 * =========
 * - expo-router
 * - react-native-gesture-handler
 * - @/utils/loadConfig
 */

import { useEffect } from "react";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet, Platform } from "react-native";
import { config } from "@/utils/loadConfig";

// 1. 전역 Stack 옵션과 제스처 루트를 설정한다.
export default function RootLayout() {

  // ★ 2. Adobe Target Launch 스크립트를 <head>에 삽입한다 (웹 전용).
  useEffect(() => {
    if (Platform.OS !== "web") return;
    if (document.querySelector('script[data-at-js]')) return;

    const script = document.createElement("script");
    script.src =
      "https://assets.adobedtm.com/ce8d64c4e8e1/4c86ea242857/launch-5485615ab996.min.js";
    script.async = true;
    script.setAttribute("data-at-js", "true");
    document.head.appendChild(script);
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <Stack
        screenOptions={{
          headerTitle: config.app_title,
          headerTitleAlign: "center",
          headerStyle: { backgroundColor: "#4A90D9" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "700", fontSize: 20 },
        }}
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
