/**
 * components/AppFooter.tsx (전역 하단 페이지 이동 푸터)
 * ================================================================================
 * 메인·프로필 테스트·추천 테스트·스크롤 테스트·XT 테스트·A/B 테스트 라우트로 이동하는 고정 푸터. 루트 `_layout` 에서 모든 화면 하단에 공통으로 붙인다.
 *
 * [Main Functions]
 * ===========
 * - AppFooter: 현재 경로 강조 + `router.replace` 로 화면 전환(메인 `/main`)
 * - 하단 safe-area inset 반영으로 모바일 제스처 바/홈버튼과 클릭 충돌 방지
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - AppFooter(): React.ReactElement
 *
 * [Dependencies]
 * =========
 * - expo-router (usePathname, useRouter)
 * - react-native-safe-area-context (useSafeAreaInsets)
 * - react-native
 */

import React, { useCallback, useMemo } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePathname, useRouter, type Href } from "expo-router";
import { normalizeAppPathname } from "@/utils/digitalData";

/**
 * 기기 제스처 바/홈버튼(하단 safe-area inset) "위에" 항상 더해 줄 간격(px) — 네이티브 전용.
 * 이 값을 키우면 홈버튼과 링크 버튼 사이 여백이 그만큼 넓어진다.
 */
const FOOTER_BOTTOM_GAP = 18;
/** 웹은 홈버튼이 없으므로 기본 여백만 사용(간격 불필요). */
const WEB_BOTTOM_PADDING = 10;

type FooterKey = "main" | "profile" | "recommendation" | "scroll" | "sdk" | "abtest";

const ROUTES: Record<FooterKey, string> = {
  main: "/main",
  profile: "/profile-test",
  recommendation: "/recommendation-test",
  scroll: "/scroll-test",
  sdk: "/xttest",
  abtest: "/abtest",
};

const LABELS: Record<FooterKey, string> = {
  main: "메인",
  profile: "프로필 테스트",
  recommendation: "추천 테스트",
  scroll: "스크롤 테스트",
  sdk: "XT 테스트",
  abtest: "A/B 테스트",
};

function activeKeyForPath(pathname: string): FooterKey {
  const p = normalizeAppPathname(pathname);
  if (p === "/profile-test") {
    return "profile";
  }
  if (p === "/recommendation-test") {
    return "recommendation";
  }
  if (p === "/scroll-test") {
    return "scroll";
  }
  if (p === "/xttest") {
    return "sdk";
  }
  if (p === "/abtest") {
    return "abtest";
  }
  return "main";
}

export default function AppFooter(): React.ReactElement {
  const pathname = usePathname();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const active = useMemo(() => activeKeyForPath(pathname), [pathname]);

  // 웹은 홈버튼이 없어 기본 여백만, 네이티브만 시스템 inset(제스처 바/홈버튼) 위에 추가 간격을 둔다.
  const bottomPadding =
    Platform.OS === "web" ? WEB_BOTTOM_PADDING : insets.bottom + FOOTER_BOTTOM_GAP;

  const go = useCallback(
    (key: FooterKey) => {
      const href = ROUTES[key];
      if (activeKeyForPath(pathname) === key) {
        return;
      }
      router.replace(href as Href);
    },
    [pathname, router],
  );

  const keys: FooterKey[] = ["main", "profile", "recommendation", "scroll", "sdk", "abtest"];

  return (
    <View style={[s.bar, { paddingBottom: bottomPadding }]} accessibilityRole="toolbar">
      {keys.map((key, i) => {
        const isActive = active === key;
        return (
          <React.Fragment key={key}>
            {i > 0 ? <View style={s.divider} /> : null}
            <Pressable
              style={({ pressed }) => [
                s.tab,
                isActive && s.tabActive,
                pressed && !isActive && s.tabPressed,
              ]}
              onPress={() => go(key)}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={LABELS[key]}
            >
              <Text style={[s.tabText, isActive && s.tabTextActive]}>{LABELS[key]}</Text>
            </Pressable>
          </React.Fragment>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "stretch",
    borderTopWidth: 1,
    borderTopColor: "#DDE1E6",
    backgroundColor: "#fff",
    paddingBottom: 10,
    paddingTop: 4,
  },
  divider: {
    width: 1,
    backgroundColor: "#E1E5EA",
    marginVertical: 6,
  },
  tab: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    minHeight: 48,
  },
  tabPressed: {
    backgroundColor: "#F0F4F8",
  },
  tabActive: {
    backgroundColor: "#E8F1FC",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555",
  },
  tabTextActive: {
    color: "#1A5FB4",
    fontWeight: "700",
  },
});
