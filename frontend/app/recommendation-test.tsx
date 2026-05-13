/**
 * app/recommendation-test.tsx (Recommendations 테스트 라우트)
 * ================================================================================
 * Adobe Target Recommendations 검증용 Expo 라우트. `/recommendation-test` 로 접근하며
 * 엔티티 클릭 시 `POST /api/target/recommendation-test` 로 추천 오퍼를 조회한다.
 *
 * [Main Functions]
 * ===========
 * - RecommendationTestScreen: RecommendationTestPanel 를 스크롤 영역에 배치
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - RecommendationTestScreen: /recommendation-test 화면
 *
 * [Dependencies]
 * =========
 * - react-native
 * - @adobe/components/RecommendationTestPanel
 */

import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import RecommendationTestPanel from "@adobe/components/RecommendationTestPanel";

export default function RecommendationTestScreen(): React.ReactElement {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <RecommendationTestPanel />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA" },
  scroll: { padding: 20 },
});
