/**
 * app/profile-test.tsx (profile script test 라우트)
 * ================================================================================
 * profile script test 전용 Expo 라우트. `/profile-test` 경로로 접근하며,
 * profileParameters 전송 → 동일 tntId 재요청을 통해 Adobe Target 프로필 저장 여부를 확인한다.
 * 운영 화면(`/`)에는 노출되지 않는다.
 *
 * [Main Functions]
 * ===========
 * - ProfileTestScreen: ProfileTestPanel 을 ScrollView 안에 배치
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - ProfileTestScreen: /profile-test 화면
 *
 * [Dependencies]
 * =========
 * - react-native
 * - @adobe/components/ProfileTestPanel (재export 대신 직접 임포트)
 */

import React from "react";
import { ScrollView, StyleSheet } from "react-native";

import ProfileTestPanel from "@adobe/components/ProfileTestPanel";

// profile script test
export default function ProfileTestScreen(): React.ReactElement {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ProfileTestPanel />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  content: {
    padding: 20,
  },
});
