/**
 * components/AppFooter.tsx (전역 하단 페이지 이동 푸터)
 * ================================================================================
 * 메인·프로필 테스트·추천 테스트·스크롤 테스트·SDK 테스트 라우트로 이동하는 고정 푸터. 루트 `_layout` 에서 모든 화면 하단에 공통으로 붙인다.
 *
 * [Main Functions]
 * ===========
 * - AppFooter: 현재 경로 강조 + `router.replace` 로 화면 전환(메인 `/main`)
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - AppFooter(): React.ReactElement
 *
 * [Dependencies]
 * =========
 * - expo-router (usePathname, useRouter)
 * - react-native
 */

import React, { useCallback, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { usePathname, useRouter, type Href } from "expo-router";
import { normalizeAppPathname } from "@/utils/digitalData";

type FooterKey = "main" | "profile" | "recommendation" | "scroll" | "sdk";

const ROUTES: Record<FooterKey, string> = {
  main: "/main",
  profile: "/profile-test",
  recommendation: "/recommendation-test",
  scroll: "/scroll-test",
  sdk: "/native-target-test",
};

const LABELS: Record<FooterKey, string> = {
  main: "메인",
  profile: "프로필 테스트",
  recommendation: "추천 테스트",
  scroll: "스크롤 테스트",
  sdk: "SDK 테스트",
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
  if (p === "/native-target-test") {
    return "sdk";
  }
  return "main";
}

export default function AppFooter(): React.ReactElement {
  const pathname = usePathname();
  const router = useRouter();
  const active = useMemo(() => activeKeyForPath(pathname), [pathname]);

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

  const keys: FooterKey[] = ["main", "profile", "recommendation", "scroll", "sdk"];

  return (
    <View style={s.bar} accessibilityRole="toolbar">
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
