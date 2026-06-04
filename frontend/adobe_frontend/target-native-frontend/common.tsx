/**
 * adobe_frontend.target-native-frontend.common (네이티브 Target 테스트 화면 공용 모듈)
 * ================================================================================
 * XT/A·B 테스트 화면이 공유하는 mbox 상수·지원 배너·스타일을 한곳에 모은다.
 * mbox 이름은 config 에서만 읽고 하드코딩 폴백을 두지 않는다(미설정이면 빈 문자열).
 * 이렇게 해야 환경변수 누락이 화면 경고로 드러나 디버깅이 쉬워진다.
 *
 * [Main Functions]
 * ===========
 * - OFFER_MBOX / GLOBAL_MBOX: config.mobile_env.adobe_sdk_mboxes 값(없으면 "")
 * - EMPTY_IDS: 비어 있는 방문자 식별자 기본값
 * - SupportBanner: 웹 미지원·mbox 미설정·정상 상태를 한 배너로 표시
 * - VisitorPanel: 방문자 식별자 표시 + ID 새로고침 + 경험 초기화(두 화면 공용)
 * - commonStyles: 두 화면 공용 스타일
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - OFFER_MBOX: string
 * - GLOBAL_MBOX: string
 * - EMPTY_IDS: TargetIds
 * - SupportBanner({ supported, mbox, readyText }): React.ReactElement
 * - VisitorPanel({ ids, onRefresh, onReset }): React.ReactElement
 * - commonStyles: StyleSheet
 *
 * [Dependencies]
 * =========
 * - react, react-native
 * - @/utils/loadConfig (config.mobile_env.adobe_sdk_mboxes)
 * - ./native/adobeMobileTarget.types (TargetIds)
 */

import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { config } from "@/utils/loadConfig";
import type { TargetIds } from "./native/adobeMobileTarget.types";

const SDK_MBOXES = config.mobile_env?.adobe_sdk_mboxes;

/** 버튼으로 호출하는 개별 오퍼 mbox. 미설정이면 ""(하드코딩 폴백 없음 → 디버그 시 누락이 드러남). */
export const OFFER_MBOX = SDK_MBOXES?.offer_sdk_mbox_name ?? "";
/** 진입 시 자동 호출하는 global mbox. 미설정이면 "". */
export const GLOBAL_MBOX = SDK_MBOXES?.global_sdk_mbox_name ?? "";

// 1. 지원/설정 상태 배너 — 웹 미지원, mbox 미설정, 정상 3가지를 명확히 구분해 표시.
export function SupportBanner({
  supported,
  mbox,
  readyText,
}: {
  supported: boolean;
  mbox: string;
  readyText: string;
}): React.ReactElement {
  const isWarn = !supported || !mbox;
  const message = !supported
    ? "웹에서는 네이티브 SDK가 동작하지 않습니다(프록시 경로 사용). 네이티브 빌드에서 테스트하세요."
    : !mbox
      ? "mbox가 설정되지 않았습니다. config.mobile_env.adobe_sdk_mboxes 를 확인하세요."
      : readyText;

  return (
    <View style={[commonStyles.banner, isWarn ? commonStyles.bannerWarn : commonStyles.bannerOk]}>
      <Text style={commonStyles.bannerText}>{message}</Text>
    </View>
  );
}

/** 비어 있는 방문자 식별자 기본값(초기/리셋 시 사용). */
export const EMPTY_IDS: TargetIds = { tntId: null, thirdPartyId: null, sessionId: null };

// 2. 방문자 식별자 패널 — IDs 표시 + ID 새로고침 + 경험 초기화. XT/A·B 화면 공용(표시는 부모 ids 사용).
export function VisitorPanel({
  ids,
  onRefresh,
  onReset,
}: {
  ids: TargetIds;
  onRefresh: () => void;
  onReset: () => void;
}): React.ReactElement {
  return (
    <>
      <Text style={commonStyles.label}>방문자 식별자</Text>
      <View style={commonStyles.resultBox}>
        <Text style={commonStyles.idText}>tntId: {ids.tntId ?? "-"}</Text>
        <Text style={commonStyles.idText}>thirdPartyId: {ids.thirdPartyId ?? "-"}</Text>
        <Text style={commonStyles.idText}>sessionId: {ids.sessionId ?? "-"}</Text>
      </View>
      <Pressable
        style={({ pressed }) => [commonStyles.btnSecondary, pressed && commonStyles.btnPressed]}
        onPress={onRefresh}
      >
        <Text style={commonStyles.btnSecondaryText}>ID 새로고침</Text>
      </Pressable>
      <Pressable
        style={({ pressed }) => [commonStyles.btnDanger, pressed && commonStyles.btnPressed]}
        onPress={onReset}
      >
        <Text style={commonStyles.btnText}>경험 초기화(식별자 제거)</Text>
      </Pressable>
    </>
  );
}

// 3. 공용 스타일 — 컨테이너/타이틀/배너/라벨/버튼/결과박스 등 두 화면이 함께 쓰는 부분만.
export const commonStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA" },
  content: { padding: 20, gap: 6 },
  title: { fontSize: 22, fontWeight: "700", color: "#1A1A2E", marginBottom: 8 },
  banner: { borderRadius: 8, padding: 12, marginBottom: 8 },
  bannerOk: { backgroundColor: "#E6F4EA", borderColor: "#34A853", borderWidth: 1 },
  bannerWarn: { backgroundColor: "#FDECEA", borderColor: "#D93025", borderWidth: 1 },
  bannerText: { fontSize: 13, color: "#333", lineHeight: 18 },
  label: { fontSize: 13, fontWeight: "600", color: "#555", marginTop: 12 },
  btn: {
    backgroundColor: "#1A5FB4",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 12,
    minHeight: 50,
    justifyContent: "center",
  },
  btnPressed: { opacity: 0.8 },
  btnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  btnSecondary: {
    backgroundColor: "#E8F1FC",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },
  btnSecondaryText: { color: "#1A5FB4", fontSize: 14, fontWeight: "700" },
  btnDanger: {
    backgroundColor: "#D93025",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 20,
  },
  resultBox: {
    borderWidth: 1,
    borderColor: "#E1E5EA",
    borderRadius: 8,
    backgroundColor: "#fff",
    padding: 12,
    minHeight: 44,
  },
  resultText: { fontSize: 14, color: "#1A1A2E" },
  idText: { fontSize: 13, color: "#333", marginVertical: 1 },
});
