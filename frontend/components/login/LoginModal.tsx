/**
 * components/login/LoginModal.tsx (회선 선택 로그인 모달)
 * ================================================================================
 * telecom_test_lines 회선 목록을 넓은 테이블로 보여주고, 한 행을 선택(단일 선택)해 "로그인"하면
 * 그 회선ID(line_id)를 Adobe Target 식별자(thirdPartyId)로 주입한다(VisitorContext.login).
 * 테스트 취지: "이 회선으로 접속한 고객에게 어떤 띠배너/팝업이 적용되는지"를 식별자만 바꿔 즉시 확인.
 *
 * [Main Functions]
 * ===========
 * - LoginModal: 회선 목록 fetch → 테이블 렌더 → 행 선택 → 취소/로그인
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - LoginModal({ visible, onClose })
 *
 * [Dependencies]
 * =========
 * - react-native (Modal, ScrollView, Pressable 등)
 * - ./telecomLinesApi (fetchTelecomLines, TelecomLine)
 * - @/context/VisitorContext (useVisitorLogin)
 */

import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useVisitorLogin } from "@/context/VisitorContext";
import { fetchTelecomLines, type TelecomLine } from "./telecomLinesApi";

const MAGENTA = "#E6007E";

/** 테이블 컬럼 정의(라벨·폭·셀 텍스트 생성). 폭 합이 화면보다 넓으면 가로 스크롤. */
interface Column {
  key: string;
  label: string;
  width: number;
  value: (l: TelecomLine) => string;
}

function _fee(n: number): string {
  return `${Number(n ?? 0).toLocaleString()}원`;
}

function _dday(d: number | null): string {
  if (d === null || d === undefined) return "-";
  if (d < 0) return "만료";
  return d === 0 ? "D-day" : `D-${d}`;
}

const COLUMNS: Column[] = [
  { key: "line_id", label: "회선ID", width: 90, value: (l) => l.line_id },
  { key: "customer_name", label: "고객명", width: 80, value: (l) => l.customer_name },
  { key: "customer_grade", label: "등급", width: 70, value: (l) => l.customer_grade },
  { key: "plan_name", label: "요금제", width: 150, value: (l) => l.plan_name },
  { key: "network_type", label: "망", width: 56, value: (l) => l.network_type },
  { key: "monthly_fee", label: "월요금", width: 92, value: (l) => _fee(l.monthly_fee) },
  {
    key: "contract",
    label: "약정만료",
    width: 120,
    value: (l) => `${l.contract_end_date ?? "무약정"}\n${_dday(l.contract_d_day)}`,
  },
  { key: "device_model", label: "단말", width: 150, value: (l) => l.device_model },
  { key: "data_usage_pct", label: "데이터", width: 70, value: (l) => `${l.data_usage_pct}%` },
  { key: "bundle_yn", label: "결합", width: 56, value: (l) => l.bundle_yn },
  { key: "age_group", label: "연령", width: 70, value: (l) => l.age_group },
  { key: "churn_risk", label: "해지위험", width: 80, value: (l) => l.churn_risk },
  { key: "marketing_consent_yn", label: "수신동의", width: 80, value: (l) => l.marketing_consent_yn },
];

const TABLE_WIDTH = COLUMNS.reduce((sum, c) => sum + c.width, 0);

// 1. [헤더행] 컬럼 라벨을 고정 폭으로 그린다.
function TableHeader(): React.ReactElement {
  return (
    <View style={[s.row, s.headerRow, { width: TABLE_WIDTH }]}>
      {COLUMNS.map((c) => (
        <Text key={c.key} style={[s.cell, s.headerCell, { width: c.width }]} numberOfLines={2}>
          {c.label}
        </Text>
      ))}
    </View>
  );
}

// 2. [데이터행] 클릭 시 선택. 선택된 행은 마젠타 톤으로 강조한다.
function TableRow({
  line,
  selected,
  zebra,
  onPress,
}: {
  line: TelecomLine;
  selected: boolean;
  zebra: boolean;
  onPress: () => void;
}): React.ReactElement {
  return (
    <Pressable
      onPress={onPress}
      style={[
        s.row,
        { width: TABLE_WIDTH },
        zebra && s.zebra,
        selected && s.selectedRow,
      ]}
    >
      {COLUMNS.map((c) => (
        <Text
          key={c.key}
          style={[s.cell, { width: c.width }, selected && s.selectedText]}
          numberOfLines={2}
        >
          {c.value(line)}
        </Text>
      ))}
    </Pressable>
  );
}

// 3. [모달] 목록 조회 → 테이블 → 선택 → 취소/로그인. 로그인 시 line_id 를 식별자로 주입.
export default function LoginModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}): React.ReactElement {
  const login = useVisitorLogin();
  const [lines, setLines] = useState<TelecomLine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<TelecomLine | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!visible) {
      return;
    }
    setSelected(null);
    setError(null);
    setLoading(true);
    fetchTelecomLines()
      .then(setLines)
      .catch((e) => setError(String(e?.message ?? e)))
      .finally(() => setLoading(false));
  }, [visible]);

  const onLogin = async () => {
    if (!selected || submitting) {
      return;
    }
    setSubmitting(true);
    try {
      await login({
        lineId: selected.line_id,
        customerName: selected.customer_name,
        planName: selected.plan_name,
        customerGrade: selected.customer_grade,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.panel}>
          <View style={s.panelHeader}>
            <View style={s.headerTextWrap}>
              <Text style={s.panelTitle}>회선 선택 로그인</Text>
              <Text style={s.panelSubtitle}>
                회선을 선택하면 해당 회선ID가 Target 식별자(thirdPartyId)로 적용됩니다.
              </Text>
            </View>
            <View style={s.headerActions}>
              <Pressable onPress={onClose} style={[s.btn, s.btnGhost]}>
                <Text style={s.btnGhostText}>취소</Text>
              </Pressable>
              <Pressable
                onPress={onLogin}
                disabled={!selected || submitting}
                style={[s.btn, s.btnPrimary, (!selected || submitting) && s.btnDisabled]}
              >
                <Text style={s.btnPrimaryText}>
                  {submitting ? "로그인 중..." : "로그인"}
                </Text>
              </Pressable>
            </View>
          </View>

          <View style={s.tableArea}>
            {loading ? (
              <View style={s.center}>
                <ActivityIndicator color={MAGENTA} />
                <Text style={s.dim}>회선 목록을 불러오는 중…</Text>
              </View>
            ) : error ? (
              <View style={s.center}>
                <Text style={s.errorText}>목록을 불러오지 못했습니다.</Text>
                <Text style={s.dim}>{error}</Text>
              </View>
            ) : (
              <ScrollView horizontal>
                <View>
                  <TableHeader />
                  <ScrollView style={s.bodyScroll}>
                    {lines.map((l, i) => (
                      <TableRow
                        key={l.line_id}
                        line={l}
                        zebra={i % 2 === 1}
                        selected={selected?.line_id === l.line_id}
                        onPress={() => setSelected(l)}
                      />
                    ))}
                  </ScrollView>
                </View>
              </ScrollView>
            )}
          </View>

          <Text style={s.footerHint}>
            {selected
              ? `선택됨 · ${selected.line_id} (${selected.customer_name} / ${selected.plan_name})`
              : "행을 클릭해 회선을 선택하세요."}
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  panel: {
    width: "94%",
    maxWidth: 1180,
    height: "84%",
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
  },
  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTextWrap: { flex: 1, paddingRight: 12 },
  panelTitle: { fontSize: 18, fontWeight: "700", color: "#1A1A2E" },
  panelSubtitle: { fontSize: 12, color: "#666", marginTop: 2 },
  headerActions: { flexDirection: "row", alignItems: "center" },
  btn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
    marginLeft: 8,
  },
  btnGhost: { backgroundColor: "#f1f1f4" },
  btnGhostText: { color: "#333", fontWeight: "600" },
  btnPrimary: { backgroundColor: MAGENTA },
  btnPrimaryText: { color: "#fff", fontWeight: "700" },
  btnDisabled: { opacity: 0.45 },
  tableArea: { flex: 1 },
  bodyScroll: { flexGrow: 0 },
  row: { flexDirection: "row", alignItems: "stretch" },
  headerRow: { backgroundColor: "#1A1A2E" },
  zebra: { backgroundColor: "#faf7fb" },
  selectedRow: { backgroundColor: "#fde3f1" },
  cell: {
    paddingHorizontal: 8,
    paddingVertical: 10,
    fontSize: 12,
    color: "#222",
    borderRightWidth: 1,
    borderRightColor: "#eee",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerCell: { color: "#fff", fontWeight: "700", borderRightColor: "#333", borderBottomColor: "#333" },
  selectedText: { color: "#a1005a", fontWeight: "700" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  dim: { color: "#888", marginTop: 8, fontSize: 12 },
  errorText: { color: "#c0392b", fontWeight: "700" },
  footerHint: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 12,
    color: "#555",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
});
