/**
 * adobe_frontend.target-native-frontend.RecommendationScreen (네이티브 Target 추천 테스트 화면)
 * ================================================================================
 * 네이티브 SDK 로 Adobe Target Recommendations 를 검증한다. mbox 는 추천 전용 REC_MBOX(target-rec-msdk-mbox)
 * 를 사용한다 — XT 활동(offer mbox)과 location 이 겹치면 XT 오퍼가 반환되므로 추천만 별도 mbox 로 분리한다.
 *
 * 상단 [데이터 적재]: "추천 데이터 보내기"를 누르면 1초 간격으로 RECIPIENT_IDS 를 순차 순회하며
 *   매 틱 무작위 메뉴 2~5개를 한 주문(entity+product+order)으로 묶어 전송한다. 멈출 때까지 반복해
 *   Adobe 에 "People Who Bought This, Bought That" 학습 데이터(co-purchase 쌍)를 쌓는다(수신자는 thirdPartyId 로 구분).
 * 하단 [추천 가져오기]: 선택한 수신자 기준으로 offer mbox 를 호출해 추천 결과(JSON)를 파싱·표시한다.
 *
 * 라우트 파일(app/recommendation.tsx)에서 이 컴포넌트를 default 로 re-export 한다.
 *
 * [Main Functions]
 * ===========
 * - RecommendationScreen: 데이터 적재 루프(start/stop) + 추천 조회
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - RecommendationScreen(): React.ReactElement
 *
 * [Dependencies]
 * =========
 * - react, react-native
 * - ./native/adobeMobileTarget (sendTargetRecommendationData / setTargetVisitor / retrieveTargetContent / isAdobeMobileTargetSupported)
 * - ./recommendationData (RECIPIENT_IDS, pickRandomEntities, parseRecommendations, pickRecLabel, pickRecId)
 * - ./common (REC_MBOX, SupportBanner, commonStyles)
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  isAdobeMobileTargetSupported,
  retrieveTargetContent,
  sendTargetRecommendationData,
  setTargetVisitor,
} from "./native/adobeMobileTarget";
import {
  RECIPIENT_IDS,
  parseRecommendations,
  pickRandomEntities,
  pickRecId,
  pickRecLabel,
} from "./recommendationData";
import { REC_MBOX, SupportBanner, commonStyles as c } from "./common";

const SEND_INTERVAL_MS = 1000;
const MAX_LOG = 8;
const REC_SLOTS = 5;

export default function RecommendationScreen(): React.ReactElement {
  const supported = isAdobeMobileTargetSupported();
  const ready = supported && !!REC_MBOX;

  const [sending, setSending] = useState(false);
  const [sentCount, setSentCount] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const [recipient, setRecipient] = useState<string>(RECIPIENT_IDS[0] ?? "");
  const [recs, setRecs] = useState<unknown[]>([]);
  const [rawRec, setRawRec] = useState("");
  const [loadingRec, setLoadingRec] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recipientIdxRef = useRef(0);

  // 1. 한 틱: 다음 수신자 + 무작위 메뉴 묶음(2~5개)을 한 주문으로 전송(thirdPartyId 로 수신자 구분).
  //    여러 품목을 묶어 보내야 co-purchase 쌍이 빨리 형성된다.
  const sendOne = useCallback(() => {
    const rid = RECIPIENT_IDS[recipientIdxRef.current % RECIPIENT_IDS.length] ?? "";
    recipientIdxRef.current += 1;
    const items = pickRandomEntities();
    const ids = items.map((e) => e.id);
    const total = items.reduce((sum, e) => sum + e.price, 0);
    const rep = items[0];
    sendTargetRecommendationData(REC_MBOX, {
      thirdPartyId: rid,
      entityId: rep.id,
      categoryId: rep.categoryId,
      entityName: rep.name,
      total,
      purchasedProductIds: ids,
    });
    setSentCount((n) => n + 1);
    setLog((prev) =>
      [`${rid} ← 품목 ${ids.length}개 (id:${ids.join(",")})`, ...prev].slice(0, MAX_LOG),
    );
  }, []);

  // 2. 적재 시작/멈춤 토글(1초 인터벌). 시작 즉시 1회 전송.
  const toggleSending = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setSending(false);
      return;
    }
    if (!ready) {
      return;
    }
    setSending(true);
    sendOne();
    intervalRef.current = setInterval(sendOne, SEND_INTERVAL_MS);
  }, [ready, sendOne]);

  // 3. 언마운트 시 인터벌 정리(누수 방지).
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  // 4. 추천 가져오기 — 선택 수신자(thirdPartyId)로 offer mbox 호출 후 결과 파싱.
  const fetchRecs = useCallback(async () => {
    if (!ready) {
      return;
    }
    setLoadingRec(true);
    try {
      setTargetVisitor(recipient);
      const raw = await retrieveTargetContent(REC_MBOX, "");
      setRawRec(raw);
      setRecs(parseRecommendations(raw).slice(0, REC_SLOTS));
    } finally {
      setLoadingRec(false);
    }
  }, [ready, recipient]);

  const slots: (unknown | null)[] = Array.from({ length: REC_SLOTS }, (_, i) => recs[i] ?? null);

  return (
    <ScrollView style={c.container} contentContainerStyle={c.content}>
      <Text style={c.title}>네이티브 Target 추천 테스트</Text>

      <SupportBanner
        supported={supported}
        mbox={REC_MBOX}
        readyText={`네이티브 SDK 사용 가능 — mbox "${REC_MBOX}" 로 추천 데이터/조회를 수행합니다.`}
      />

      {/* ── [데이터 적재] 1초 간격으로 수신자 순회 + 무작위 구매 전송 ── */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>① 추천 데이터 적재</Text>
        <Text style={s.desc}>
          버튼을 누르면 1초마다 수신자 {RECIPIENT_IDS.length}명을 순서대로 돌며 무작위 메뉴 2~5개를{"\n"}
          한 주문으로 묶어 구매(order) 이벤트로 전송합니다. 묶음 구매로 co-purchase 쌍을 빠르게 쌓습니다.
        </Text>
        <Pressable
          style={({ pressed }) => [
            sending ? s.btnStop : c.btn,
            pressed && c.btnPressed,
          ]}
          onPress={toggleSending}
          disabled={!ready}
        >
          <Text style={c.btnText}>{sending ? "보내기 멈춤" : "추천 데이터 보내기"}</Text>
        </Pressable>

        <View style={s.metaRow}>
          {sending ? <ActivityIndicator size="small" color="#1A5FB4" /> : null}
          <Text style={s.metaText}>전송 누계: {sentCount}건</Text>
        </View>

        <Text style={c.label}>최근 전송</Text>
        <View style={c.resultBox}>
          {log.length === 0 ? (
            <Text style={s.logText}>(아직 없음)</Text>
          ) : (
            log.map((line, i) => (
              <Text key={i} style={s.logText}>
                {line}
              </Text>
            ))
          )}
        </View>
      </View>

      {/* ── [추천 가져오기] 선택 수신자 기준 offer mbox 호출 ── */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>② 추천 가져오기</Text>
        <Text style={s.desc}>수신자를 선택하고 추천을 가져옵니다(thirdPartyId 기준).</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chipRow}>
          {RECIPIENT_IDS.map((rid) => {
            const sel = rid === recipient;
            return (
              <Pressable
                key={rid}
                style={[s.chip, sel && s.chipSel]}
                onPress={() => setRecipient(rid)}
              >
                <Text style={[s.chipText, sel && s.chipTextSel]}>{rid}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Pressable
          style={({ pressed }) => [c.btn, pressed && c.btnPressed]}
          onPress={fetchRecs}
          disabled={!ready || loadingRec}
        >
          {loadingRec ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={c.btnText}>추천 가져오기</Text>
          )}
        </Pressable>

        <Text style={c.label}>추천 결과 (Top {REC_SLOTS})</Text>
        <View style={s.recRow}>
          {slots.map((slot, idx) => {
            const label = slot != null ? pickRecLabel(slot) : "-";
            const recId = slot != null ? pickRecId(slot) : "";
            return (
              <View key={idx} style={s.recSlot}>
                <Text style={s.recIdx}>{idx + 1}</Text>
                <Text style={s.recName} numberOfLines={4}>
                  {label}
                </Text>
                {recId ? <Text style={s.recId}>{recId}</Text> : null}
              </View>
            );
          })}
        </View>

        <Text style={c.label}>응답 콘텐츠(JSON)</Text>
        <View style={c.resultBox}>
          <Text style={c.resultText}>{rawRec || "(아직 없음)"}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

// 이 화면 고유 스타일만 정의(공용은 common.commonStyles).
const s = StyleSheet.create({
  section: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E1E5EA",
    paddingTop: 12,
  },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#1A1A2E", marginBottom: 6 },
  desc: { fontSize: 12.5, color: "#5A6B7B", lineHeight: 18, marginBottom: 8 },
  btnStop: {
    backgroundColor: "#D93025",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 12,
    minHeight: 50,
    justifyContent: "center",
  },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10 },
  metaText: { fontSize: 13, color: "#333", fontWeight: "600" },
  logText: { fontSize: 12, color: "#333", marginVertical: 1 },
  chipRow: { marginVertical: 8 },
  chip: {
    borderWidth: 1,
    borderColor: "#CCD3DB",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 6,
    backgroundColor: "#FAFBFC",
  },
  chipSel: { backgroundColor: "#E8F1FC", borderColor: "#1A5FB4" },
  chipText: { fontSize: 12, color: "#555" },
  chipTextSel: { color: "#1A5FB4", fontWeight: "700" },
  recRow: { flexDirection: "row", gap: 6, justifyContent: "space-between" },
  recSlot: {
    flex: 1,
    minWidth: 0,
    minHeight: 84,
    borderWidth: 1,
    borderColor: "#CCD3DB",
    borderRadius: 6,
    padding: 6,
    backgroundColor: "#FAFBFC",
    alignItems: "center",
  },
  recIdx: { fontSize: 11, fontWeight: "700", color: "#1A5FB4", marginBottom: 4 },
  recName: { fontSize: 10, color: "#333", textAlign: "center" },
  recId: { fontSize: 9, color: "#8899A8", textAlign: "center", marginTop: 2 },
});
