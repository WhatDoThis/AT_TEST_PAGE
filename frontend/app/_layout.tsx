/**
 * app/_layout.tsx (Expo Router 루트 레이아웃)
 * ================================================================================
 * Stack 네비게이션과 공통 헤더(앱 타이틀)를 적용한다.
 * Adobe Target 은 `TargetAppProvider` + 웹 전용 `TargetPageBootstrap`(첫 로드 시 bootstrap mbox offers)만 연결한다.
 *
 * [Main Functions]
 * ===========
 * - 전역 레이아웃: AppHeader(앱 네임 라벨) → TopBanner → Stack 화면 → BottomBanner → AppFooter 순서로 고정
 * - Stack 은 headerShown:false (헤더는 AppHeader 가 대신, 그 바로 아래에 상단 띠배너를 끼움)
 * - 하단 AppFooter(메인·프로필 테스트·추천 테스트 이동) 바로 위에 하단 띠배너 배치
 * - (AT) TargetAppProvider + TargetPageBootstrap (띠배너 오퍼도 동일 bootstrap 응답에서 채움)
 * - (웹) DigitalDataSync — `window.digitalData.page.pageInfo.pageName`
 * - (웹) RN Web pointerEvents deprecation 경고 LogBox 무시
 * - (Android) 몰입형 내비게이션 바: 홈/제스처 바를 숨기고 하단에서 위로 스와이프할 때만 잠깐 노출
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - RootLayout, RootLayoutInner
 *
 * [Dependencies]
 * =========
 * - expo-router
 * - expo-navigation-bar (Android 내비게이션 바 숨김/스와이프 노출)
 * - react-native-gesture-handler
 * - react-native-safe-area-context (SafeAreaProvider — 하단 inset)
 * - @/components/AppHeader (앱 네임 라벨 헤더)
 * - @/components/AppFooter
 * - @/components/banners/TopBanner, BottomBanner (LGU+ 스타일 상/하단 띠배너)
 * - @adobe/app/targetApp
 * - @adobe/app/TargetPageBootstrap
 * - @/components/DigitalDataSync
 */

import { useEffect } from "react";
import { Stack } from "expo-router";
import * as NavigationBar from "expo-navigation-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StyleSheet, Platform, LogBox, View } from "react-native";
import AppHeader from "@/components/AppHeader";
import AppFooter from "@/components/AppFooter";
import TopBanner from "@/components/banners/TopBanner";
import BottomBanner from "@/components/banners/BottomBanner";
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

  // (Android) 몰입형 내비게이션 바: 숨김 + overlay-swipe(아래에서 위로 스와이프 시 잠깐 노출 후 자동 숨김).
  // 일반 앱처럼 홈버튼이 평소엔 가려져 푸터 링크와 겹치지 않는다(웹/iOS는 미적용).
  useEffect(() => {
    if (Platform.OS !== "android") return;
    NavigationBar.setBehaviorAsync("overlay-swipe").catch(() => {});
    NavigationBar.setVisibilityAsync("hidden").catch(() => {});
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      {/* SafeAreaProvider: 하단 푸터가 기기 제스처 바/홈버튼 영역을 피하도록 inset 제공(웹은 0) */}
      <SafeAreaProvider>
        <TargetPageBootstrap />
        <DigitalDataSync />
        <View style={styles.body}>
          {/* 앱 네임 라벨(헤더) → 그 바로 아래 상단 띠배너 */}
          <AppHeader />
          <TopBanner />
          <View style={styles.stackArea}>
            <Stack screenOptions={{ headerShown: false }} />
          </View>
          {/* 하단 띠배너 → 그 아래 전역 푸터 */}
          <BottomBanner />
          <AppFooter />
        </View>
      </SafeAreaProvider>
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
