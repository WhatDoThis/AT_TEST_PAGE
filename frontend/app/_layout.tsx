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

import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet } from "react-native";
import { config } from "@/utils/loadConfig";

// 1. 전역 Stack 옵션과 제스처 루트를 설정한다.
export default function RootLayout() {
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
