/**
 * app/_layout.tsx (Expo Router 루트 레이아웃)
 * ================================================================================
 * Stack 네비게이션과 공통 헤더(앱 타이틀)를 적용한다.
 * Adobe Target UI 트리·오퍼 프리로드는 **앱 패키지 밖** `adobe_frontend/target_frontend/app/targetApp.tsx` 에서 주입한다.
 * (mbox 등 설정 값은 `frontend/env/config.adobe.json` → `@/utils/loadConfig` 병합 경로)
 *
 * [Main Functions]
 * ===========
 * - Stack screenOptions로 헤더 스타일 구성
 * - (AT) TargetAppProvider + TargetOffersPreload
 * - (웹) RN Web pointerEvents deprecation 경고 LogBox 무시
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - RootLayout: TargetAppProvider 로 트리 감쌈
 * - RootLayoutInner: 프리로드·Stack
 *
 * [Dependencies]
 * =========
 * - expo-router
 * - react-native-gesture-handler
 * - @/utils/loadConfig
 * - @adobe/app/targetApp (→ frontend/adobe_frontend/target_frontend/app/targetApp.tsx)
 */

import { useEffect } from "react";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet, Platform, LogBox } from "react-native";
import { config } from "@/utils/loadConfig";

// ════════════════════════════════════════════════════════════════════════════════
// [BRIDGE · Adobe] 패키지 임포트 — 실제 파일: frontend/adobe_frontend/.../targetApp.tsx
// ── tsconfig 별칭: @adobe/app/targetApp
// ── 심볼: TargetAppProvider(Context 루트), TargetOffersPreload(웹 offers fetch; mbox는 loadConfig 경유)
// ════════════════════════════════════════════════════════════════════════════════
import { TargetAppProvider, TargetOffersPreload } from "@adobe/app/targetApp";
// ════════════════════════════════════════════════════════════════════════════════
// [BRIDGE · Adobe] 임포트 끝 — 이하 앱 코어 레이아웃
// ════════════════════════════════════════════════════════════════════════════════

export default function RootLayout() {
  // ── [BRIDGE · Adobe] JSX — 앱 루트를 Adobe Target Provider 로 감쌈
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
      {/* ── [BRIDGE · Adobe] 웹 offers 프리로드(내부 fetch · sessionStorage · Context) ── */}
      <TargetOffersPreload />
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
