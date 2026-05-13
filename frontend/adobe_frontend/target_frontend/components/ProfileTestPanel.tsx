/**
 * adobe_frontend.target_frontend.components.ProfileTestPanel (profile script test UI)
 * ================================================================================
 * profile script test 응답 표시 전용 패널. profileParameters 를 전송하고 Adobe Target 서버 응답을
 * JSON.stringify 로 표기한다. Re-fetch 응답에 `type: event-popup` 오퍼가 있으면
 * 메인 화면과 동일한 EventPopup(Modal) 으로 표시한다.
 *
 * [Main Functions]
 * ===========
 * - ProfileTestPanel: Send testVal / Send testNotVal / Re-fetch 버튼 + 응답 JSON + EventPopup
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - ProfileTestPanel(): React.ReactElement
 *
 * [Dependencies]
 * =========
 * - react, react-native
 * - ./EventPopup (이벤트 팝업 UI)
 * - ../utils/targetOfferParser (parseAdobeTargetOffersPayload)
 * - ../utils/targetProfileTest (testProfileParameters)
 */

import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import EventPopup from "./EventPopup";
import {
  parseAdobeTargetOffersPayload,
  type AdobeTargetEventPopupOffer,
} from "../utils/targetOfferParser";
import { testProfileParameters } from "../utils/targetProfileTest";

export default function ProfileTestPanel(): React.ReactElement {
  const [response, setResponse] = useState<string>("");
  const [status, setStatus] = useState<string>("대기 중");
  const [busy, setBusy] = useState(false);
  const [popupOffer, setPopupOffer] = useState<AdobeTargetEventPopupOffer | null>(null);

  const send = useCallback(
    async (
      profileParams: Record<string, string>,
      label: string,
      checkPopup: boolean,
    ) => {
      if (busy) return;
      setBusy(true);
      setStatus(`${label} 요청 중...`);
      try {
        const res = await testProfileParameters({ profileParams });
        setStatus(`${label}: ${res.ok ? "성공" : "실패"} (${res.status})`);
        setResponse(JSON.stringify(res.data, null, 2));

        if (checkPopup) {
          const { eventPopup } = parseAdobeTargetOffersPayload(res.data);
          setPopupOffer(eventPopup);
        } else {
          setPopupOffer(null);
        }
      } catch (err) {
        setPopupOffer(null);
        setStatus(`${label} 실패: ${(err as Error).message}`);
      } finally {
        setBusy(false);
      }
    },
    [busy],
  );

  return (
    <View style={s.container}>
      <Text style={s.title}>profileParameters 저장 검증</Text>
      <Text style={s.desc}>
        Send testVal → Re-fetch 시 Adobe 서버 응답에 오퍼가 내려오면 프로필 저장 확인 완료.
        Send testNotVal → Re-fetch 시 Audience 미충족으로 오퍼 없음 확인. 매칭 시 event-popup 이
        모달로 표시된다.
      </Text>

      <View style={s.row}>
        <Pressable
          style={[s.btn, { backgroundColor: "#4A90D9" }, busy && s.off]}
          disabled={busy}
          onPress={() => send({ testKey: "testVal" }, "Send testVal", false)}
        >
          <Text style={s.btnTxt}>Send testVal</Text>
        </Pressable>
        <Pressable
          style={[s.btn, { backgroundColor: "#D9844A" }, busy && s.off]}
          disabled={busy}
          onPress={() => send({ testKey: "testNotVal" }, "Send testNotVal", false)}
        >
          <Text style={s.btnTxt}>Send testNotVal</Text>
        </Pressable>
      </View>

      <Pressable
        style={[s.btn, { backgroundColor: "#6BA644", marginTop: 8 }, busy && s.off]}
        disabled={busy}
        onPress={() => send({}, "Re-fetch", true)}
      >
        <Text style={s.btnTxt}>Re-fetch (매칭 확인)</Text>
      </Pressable>

      <View style={s.statusRow}>
        {busy && <ActivityIndicator size="small" color="#4A90D9" />}
        <Text style={s.statusTxt}>{status}</Text>
      </View>

      <Text style={s.label}>Adobe Target 서버 응답</Text>
      <ScrollView style={s.resultBox}>
        <Text style={s.resultTxt} selectable>
          {response || "아직 응답 없음"}
        </Text>
      </ScrollView>

      <EventPopup offer={popupOffer} onClose={() => setPopupOffer(null)} />
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E1E5EA",
  },
  title: { fontSize: 16, fontWeight: "700", color: "#222", marginBottom: 4 },
  desc: { fontSize: 12, color: "#555", marginBottom: 12, lineHeight: 18 },
  label: { fontSize: 12, fontWeight: "600", color: "#444", marginTop: 12, marginBottom: 4 },
  row: { flexDirection: "row", gap: 8 },
  btn: { flex: 1, paddingVertical: 10, borderRadius: 6, alignItems: "center" },
  off: { opacity: 0.5 },
  btnTxt: { color: "#fff", fontWeight: "700", fontSize: 13 },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10 },
  statusTxt: { color: "#333", fontSize: 12 },
  resultBox: {
    maxHeight: 300,
    borderWidth: 1,
    borderColor: "#CCD3DB",
    borderRadius: 6,
    padding: 8,
    backgroundColor: "#0F172A",
  },
  resultTxt: { fontSize: 11, color: "#E2E8F0", fontFamily: "monospace" },
});
