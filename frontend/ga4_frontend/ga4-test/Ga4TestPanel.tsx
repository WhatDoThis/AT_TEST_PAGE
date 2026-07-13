/**
 * ga4_frontend.ga4-test.Ga4TestPanel (GA4 dataLayer 테스트 패널 UI)
 * ================================================================================
 * 버튼 클릭으로 다양한 dataLayer.push() 이벤트를 발생시키고, 현재 dataLayer 상태를
 * 실시간 모니터로 보여주는 테스트 UI. Adobe Tags 의 Google Data Layer Extension 이
 * 이벤트를 잡는지 검증하는 용도다. window.dataLayer 는 웹 전용이라 웹에서만 동작하며,
 * 네이티브에서는 안내 문구만 표시한다(RN 트리와 호환되도록 순수 HTML 대신 RN 컴포넌트로 구현).
 *
 * [Main Functions]
 * ===========
 * - Ga4TestPanel: 이벤트 버튼 5종 + 실시간 dataLayer 모니터
 * - handlePush: 이벤트 push 후 모니터 갱신(공통)
 * - handleCustom: 프롬프트 입력으로 커스텀 이벤트 push(웹)
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - Ga4TestPanel(): JSX.Element
 *
 * [Dependencies]
 * =========
 * - react (useState, useEffect, useCallback)
 * - react-native (View, Text, Pressable, ScrollView, Platform, StyleSheet)
 * - @ga4/ga4DataLayer (isGa4Supported, getDataLayer)
 * - @ga4/ga4Events (pushPageViewPreset, pushProductClick, pushSignup, pushLogin, pushGtmClick, pushCustomEvent)
 */

import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Platform,
  StyleSheet,
} from "react-native";
import { getDataLayer, isGa4Supported } from "@ga4/ga4DataLayer";
import {
  pushPageViewPreset,
  pushProductClick,
  pushSignup,
  pushLogin,
  pushGtmClick,
  pushCustomEvent,
} from "@ga4/ga4Events";

// 페이지뷰 프리셋 버튼(behavior_var 조합) — 환경(PC/Mobile) × 채널을 다르게 주입해 오디언스 조건 테스트.
const PAGEVIEW_BUTTONS: { label: string; run: () => void }[] = [
  { label: "페이지뷰 · PC/대표채널", run: () => pushPageViewPreset("pc_main") },
  { label: "페이지뷰 · Mobile/대표채널", run: () => pushPageViewPreset("mobile_main") },
  { label: "페이지뷰 · PC/테스트채널", run: () => pushPageViewPreset("pc_test") },
];

// 인터랙션 버튼(라벨 + push 동작). 커스텀은 프롬프트가 필요해 별도 처리.
const EVENT_BUTTONS: { label: string; run: () => void }[] = [
  { label: "상품 클릭 이벤트", run: pushProductClick },
  { label: "클릭(gtm.click)", run: () => pushGtmClick("테스트 버튼 클릭") },
  { label: "회원가입 이벤트", run: pushSignup },
  { label: "로그인 이벤트", run: pushLogin },
];

// 1. dataLayer 를 모니터용 문자열로 직렬화한다.
function formatDataLayer(): string {
  const layer = getDataLayer();
  if (layer.length === 0) {
    return "(dataLayer 가 비어 있습니다)";
  }
  return layer
    .map((item, i) => `[${i}] ${JSON.stringify(item, null, 2)}`)
    .join("\n\n");
}

// 2. 테스트 패널 — 웹에서만 동작, 네이티브는 안내만 표시
export default function Ga4TestPanel() {
  const [monitor, setMonitor] = useState<string>("");

  const refresh = useCallback(() => {
    setMonitor(formatDataLayer());
  }, []);

  // 마운트 직후(부트스트랩 push 반영을 위해 약간의 지연 포함) 1회 갱신
  useEffect(() => {
    if (!isGa4Supported()) {
      return;
    }
    refresh();
    const timer = setTimeout(refresh, 500);
    return () => clearTimeout(timer);
  }, [refresh]);

  // 공통: 이벤트 push 후 모니터 갱신
  const handlePush = useCallback(
    (run: () => void) => {
      run();
      refresh();
    },
    [refresh]
  );

  // 커스텀 이벤트: 웹 prompt 로 이벤트명/키/값 입력받아 push
  const handleCustom = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }
    const eventName = window.prompt("이벤트명을 입력하세요:", "custom_event");
    if (!eventName) {
      return;
    }
    const key = window.prompt("데이터 키를 입력하세요:", "custom_key") ?? undefined;
    const value =
      window.prompt("데이터 값을 입력하세요:", "custom_value") ?? undefined;
    pushCustomEvent(eventName, key ?? undefined, value ?? undefined);
    refresh();
  }, [refresh]);

  // 네이티브: window.dataLayer 미지원 안내
  if (!isGa4Supported()) {
    return (
      <View style={styles.panel}>
        <Text style={styles.title}>dataLayer 테스트 패널</Text>
        <Text style={styles.notice}>
          이 기능은 웹(window.dataLayer)에서만 동작합니다. 웹 브라우저에서 열어
          주세요.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.panel} nativeID="dl-test-panel">
      <Text style={styles.title}>dataLayer 테스트 패널</Text>
      <Text style={styles.desc}>
        버튼 클릭 시 dataLayer.push() 가 실행됩니다. 브라우저 콘솔에서 dataLayer
        를 입력해 확인하세요.
      </Text>

      <View style={styles.buttonRow}>
        {PAGEVIEW_BUTTONS.map((btn) => (
          <Pressable
            key={btn.label}
            style={({ pressed }) => [styles.button, pressed && styles.buttonActive]}
            onPress={() => handlePush(btn.run)}
          >
            <Text style={styles.buttonText}>{btn.label}</Text>
          </Pressable>
        ))}
        {EVENT_BUTTONS.map((btn) => (
          <Pressable
            key={btn.label}
            style={({ pressed }) => [styles.button, pressed && styles.buttonActive]}
            onPress={() => handlePush(btn.run)}
          >
            <Text style={styles.buttonText}>{btn.label}</Text>
          </Pressable>
        ))}
        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonActive]}
          onPress={handleCustom}
        >
          <Text style={styles.buttonText}>커스텀 이벤트</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.buttonGhost,
            pressed && styles.buttonActive,
          ]}
          onPress={refresh}
        >
          <Text style={styles.buttonText}>모니터 새로고침</Text>
        </Pressable>
      </View>

      <Text style={styles.subTitle}>현재 dataLayer 상태</Text>
      <ScrollView style={styles.monitor} nestedScrollEnabled>
        <Text style={styles.monitorText}>{monitor}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    width: "100%",
    maxWidth: 800,
    alignSelf: "center",
    marginTop: 40,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A2E",
    marginBottom: 6,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A2E",
    marginTop: 16,
    marginBottom: 8,
  },
  desc: {
    fontSize: 13,
    color: "#666",
    marginBottom: 16,
  },
  notice: {
    fontSize: 14,
    color: "#888",
  },
  buttonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    backgroundColor: "#1473E6",
  },
  buttonGhost: {
    backgroundColor: "#6B7280",
  },
  buttonActive: {
    backgroundColor: "#0B5AB9",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  monitor: {
    maxHeight: 400,
    backgroundColor: "#1E1E1E",
    borderRadius: 8,
    padding: 16,
  },
  monitorText: {
    color: "#D4D4D4",
    fontSize: 13,
    fontFamily: Platform.OS === "web" ? "monospace" : undefined,
  },
});
