/**
 * app/native-target-test.tsx (네이티브 Target SDK 테스트 라우트 — /at-test/native-target-test)
 * ================================================================================
 * 네이티브 앱에서 Adobe Mobile SDK(AEPTarget)를 직접 호출해 mbox 콘텐츠·방문자 식별자를
 * 확인하는 테스트 화면. 웹에서는 네이티브 SDK가 no-op 이므로 안내 문구만 노출한다.
 * mbox 기본값은 `config.adobe_sdk_mboxes.offer_sdk_mbox_name`(네이티브 전용)을 사용한다.
 * 반환 오퍼가 event-popup JSON 이면 웹과 동일한 EventPopup 모달을 모바일 SDK 경로에서도 띄운다.
 *
 * [Main Functions]
 * ===========
 * - NativeTargetTestScreen: mbox 조회 / ID 조회 / Assurance 세션 / 경험 초기화 UI / (AT) event-popup 오퍼 시 EventPopup
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - NativeTargetTestScreen: /native-target-test 화면
 *
 * [Dependencies]
 * =========
 * - react, react-native
 * - @/utils/loadConfig (config)
 * - @/components/EventPopup (웹과 공용 팝업 UI)
 * - @adobe/native/adobeMobileTarget (네이티브 SDK 래퍼)
 * - @adobe/utils/targetOfferParser (parseAdobeTargetEventPopupContent)
 */

import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { config } from "@/utils/loadConfig";
import EventPopup from "@/components/EventPopup";
import {
  getTargetIds,
  isAdobeMobileTargetSupported,
  resetTargetExperience,
  retrieveTargetContent,
  startAssuranceSession,
} from "@adobe/native/adobeMobileTarget";
import type { TargetIds } from "@adobe/native/adobeMobileTarget.types";
// (AT) 웹과 동일한 event-popup 오퍼 파서. 네이티브 SDK 가 돌려준 콘텐츠 문자열을 같은 규칙으로 해석한다.
import {
  parseAdobeTargetEventPopupContent,
  type AdobeTargetEventPopupOffer,
} from "@adobe/utils/targetOfferParser";

const DEFAULT_MBOX = config.adobe_sdk_mboxes?.offer_sdk_mbox_name ?? "target-msdk-mbox";
const DEFAULT_CONTENT = "default-content";
const EMPTY_IDS: TargetIds = { tntId: null, thirdPartyId: null, sessionId: null };

export default function NativeTargetTestScreen(): React.ReactElement {
  const supported = isAdobeMobileTargetSupported();
  const [mbox, setMbox] = useState(DEFAULT_MBOX);
  const [assuranceUrl, setAssuranceUrl] = useState("");
  const [content, setContent] = useState("");
  const [ids, setIds] = useState<TargetIds>(EMPTY_IDS);
  const [loading, setLoading] = useState(false);
  // (AT) 네이티브 SDK 가 돌려준 오퍼가 event-popup JSON 이면 웹과 동일한 팝업을 띄우기 위한 상태.
  const [eventPopupOffer, setEventPopupOffer] =
    useState<AdobeTargetEventPopupOffer | null>(null);

  // 1. mbox 콘텐츠 조회 + ID 갱신 + (AT) event-popup 오퍼 감지
  const onRetrieve = useCallback(async () => {
    setLoading(true);
    try {
      const result = await retrieveTargetContent(mbox.trim() || DEFAULT_MBOX, DEFAULT_CONTENT);
      setContent(result);
      // (AT) Target 활동이 `{ "type": "event-popup", title, body, buttonText }` JSON 오퍼를 내려주면
      //      웹(main.tsx)과 똑같은 EventPopup 을 모바일 SDK 경로에서도 표시한다.
      //      event-popup 이 아니면 null → 팝업은 뜨지 않고 반환 콘텐츠만 텍스트로 보인다.
      setEventPopupOffer(parseAdobeTargetEventPopupContent(result));
      setIds(await getTargetIds());
    } finally {
      setLoading(false);
    }
  }, [mbox]);

  // 2. 방문자 식별자만 조회
  const onRefreshIds = useCallback(async () => {
    setIds(await getTargetIds());
  }, []);

  // 3. Assurance 세션 시작
  const onStartAssurance = useCallback(() => {
    startAssuranceSession(assuranceUrl);
  }, [assuranceUrl]);

  // 4. 경험 초기화(식별자 제거)
  const onReset = useCallback(() => {
    resetTargetExperience();
    setIds(EMPTY_IDS);
    setContent("");
    setEventPopupOffer(null); // (AT) 팝업 오퍼도 함께 비운다.
  }, []);

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <Text style={s.title}>네이티브 Target SDK 테스트</Text>

      <View style={[s.banner, supported ? s.bannerOk : s.bannerWarn]}>
        <Text style={s.bannerText}>
          {supported
            ? "네이티브 SDK 사용 가능 — 디바이스에서 실제 Target 호출이 동작합니다."
            : "웹에서는 네이티브 SDK가 동작하지 않습니다(프록시 경로 사용). 네이티브 빌드에서 테스트하세요."}
        </Text>
      </View>

      <Text style={s.label}>mbox 이름</Text>
      <TextInput
        style={s.input}
        value={mbox}
        onChangeText={setMbox}
        autoCapitalize="none"
        autoCorrect={false}
        placeholder={DEFAULT_MBOX}
      />

      <Pressable
        style={({ pressed }) => [s.btn, pressed && s.btnPressed]}
        onPress={onRetrieve}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={s.btnText}>오퍼 가져오기</Text>
        )}
      </Pressable>

      <Text style={s.label}>반환 콘텐츠</Text>
      <View style={s.resultBox}>
        <Text style={s.resultText}>{content || "(아직 없음)"}</Text>
      </View>

      <Text style={s.label}>방문자 식별자</Text>
      <View style={s.resultBox}>
        <Text style={s.idText}>tntId: {ids.tntId ?? "-"}</Text>
        <Text style={s.idText}>thirdPartyId: {ids.thirdPartyId ?? "-"}</Text>
        <Text style={s.idText}>sessionId: {ids.sessionId ?? "-"}</Text>
      </View>
      <Pressable
        style={({ pressed }) => [s.btnSecondary, pressed && s.btnPressed]}
        onPress={onRefreshIds}
      >
        <Text style={s.btnSecondaryText}>ID 새로고침</Text>
      </Pressable>

      <Text style={s.label}>Assurance 세션 URL</Text>
      <TextInput
        style={s.input}
        value={assuranceUrl}
        onChangeText={setAssuranceUrl}
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="예: attestpage://?adb_validation_sessionid=..."
      />
      <Pressable
        style={({ pressed }) => [s.btnSecondary, pressed && s.btnPressed]}
        onPress={onStartAssurance}
      >
        <Text style={s.btnSecondaryText}>Assurance 세션 시작</Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [s.btnDanger, pressed && s.btnPressed]}
        onPress={onReset}
      >
        <Text style={s.btnText}>경험 초기화(식별자 제거)</Text>
      </Pressable>

      {/* (AT) 웹 main.tsx 와 동일한 EventPopup 컴포넌트.
          모바일 SDK 가 받은 오퍼가 event-popup 일 때만 모달이 열린다(offer=null 이면 미렌더). */}
      <EventPopup offer={eventPopupOffer} onClose={() => setEventPopupOffer(null)} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA" },
  content: { padding: 20, gap: 6 },
  title: { fontSize: 22, fontWeight: "700", color: "#1A1A2E", marginBottom: 8 },
  banner: { borderRadius: 8, padding: 12, marginBottom: 8 },
  bannerOk: { backgroundColor: "#E6F4EA", borderColor: "#34A853", borderWidth: 1 },
  bannerWarn: { backgroundColor: "#FDECEA", borderColor: "#D93025", borderWidth: 1 },
  bannerText: { fontSize: 13, color: "#333", lineHeight: 18 },
  label: { fontSize: 13, fontWeight: "600", color: "#555", marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#CBD2D9",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: "#fff",
    color: "#1A1A2E",
  },
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
