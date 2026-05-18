/**
 * app/_layout.tsx (Expo Router 루트 레이아웃)
 * ================================================================================
 * Stack 네비게이션과 공통 헤더(앱 타이틀)를 적용한다.
 * Adobe Target 은 `TargetAppProvider` + 웹 전용 `TargetPageBootstrap`(첫 로드 시 bootstrap mbox offers)만 연결한다.
 *
 * [Main Functions]
 * ===========
 * - Stack screenOptions로 헤더 스타일 구성
 * - 하단 AppFooter(메인·프로필 테스트·추천 테스트 이동)
 * - (AT) TargetAppProvider + TargetPageBootstrap
 * - (웹) DigitalDataSync — `window.digitalData.page.pageInfo.pageName`
 * - (웹) RN Web pointerEvents deprecation 경고 LogBox 무시
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - RootLayout, RootLayoutInner
 *
 * [Dependencies]
 * =========
 * - expo-router
 * - react-native-gesture-handler
 * - @/utils/loadConfig
 * - @/components/AppFooter
 * - @adobe/app/targetApp
 * - @adobe/app/TargetPageBootstrap
 * - @/components/DigitalDataSync
 */

import { useEffect } from "react";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet, Platform, LogBox, View } from "react-native";
import { config } from "@/utils/loadConfig";
import AppFooter from "@/components/AppFooter";
import { TargetAppProvider } from "@adobe/app/targetApp";
import { TargetPageBootstrap } from "@adobe/app/TargetPageBootstrap";
import DigitalDataSync from "@/components/DigitalDataSync";

export default function RootLayout() {
  return (
    <TargetAppProvider>
      <RootLayoutInner />
    </TargetAppProvider>
  );
}

function RootLayoutInner() {
  useEffect(() => {
    if (Platform.OS !== "web") return;
    LogBox.ignoreLogs(["props.pointerEvents is deprecated. Use style.pointerEvents"]);
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <TargetPageBootstrap />
      <DigitalDataSync />
      <View style={styles.body}>
        <View style={styles.stackArea}>
          <Stack
            screenOptions={{
              headerTitle: config.app_title,
              headerTitleAlign: "center",
              headerStyle: { backgroundColor: "#4A90D9" },
              headerTintColor: "#fff",
              headerTitleStyle: { fontWeight: "700", fontSize: 20 },
            }}
          />
        </View>
        <AppFooter />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  body: {
    flex: 1,
  },
  stackArea: {
    flex: 1,
  },
});
