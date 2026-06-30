/**
 * components/login/LoginModal.tsx (로그인 모달 — 방식 선택 → 테이블 선택 / 아이디 입력)
 * ================================================================================
 * 로그인 버튼을 누르면 먼저 "로그인 방식 선택" 화면이 뜨고, 두 가지 방식 중 하나를 고른다.
 * - [테이블 선택]: telecom_test_lines 목록을 테이블로 보여주고 한 행을 선택해 로그인(기존 방식).
 * - [아이디 입력]: U000000001 ~ U005122768 범위의 회선ID를 직접 입력해 로그인.
 * 어느 방식이든 선택/입력된 회선ID(line_id)를 Adobe Target 식별자(thirdPartyId)로 주입한다
 * (VisitorContext.login). 취지: 식별자만 바꿔 적용 띠배너/팝업/오퍼를 즉시 확인.
 *
 * [Main Functions]
 * ===========
 * - LoginModal: 방식 선택(choice) → 테이블 선택(table) / 아이디 입력(input) 모드 전환·로그인
 * - ChoiceCard: 두 가지 로그인 방식 버튼 카드
 * - InputCard: 회선ID 직접 입력 폼(안내문구 + 검증 + 확인/취소)
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - LoginModal({ visible, onClose })
 * - _normalizeCustomerId(raw): 입력 회선ID 정규화·범위검증(U000000001~U005122768)
 *
 * [Dependencies]
 * =========
 * - react-native (Modal, ScrollView, Pressable, TextInput 등)
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
  TextInput,
  View,
} from "react-native";
import { useVisitorLogin } from "@/context/VisitorContext";
import { fetchTelecomLines, type TelecomLine } from "./telecomLinesApi";

const MAGENTA = "#E6007E";

/** 아이디 직접 입력 시 허용 회선ID 범위(U + 9자리, 1 ~ 5122768). */
const CUSTOMER_ID_MIN = 1;
const CUSTOMER_ID_MAX = 5122768;
const CUSTOMER_ID_MIN_LABEL = "U000000001";
const CUSTOMER_ID_MAX_LABEL = "U005122768";

type LoginMode = "choice" | "table" | "input";

/** 입력 회선ID 검증·정규화 결과. ok=false면 사용자에게 보여줄 error 포함. */
type NormalizeResult = { ok: true; id: string } | { ok: false; error: string };

// 0. 입력값을 "U+9자리"로 정규화하고 허용 범위(1~5122768)인지 검증한다(U 접두사 생략·소문자 허용).
function _normalizeCustomerId(raw: string): NormalizeResult {
  const v = raw.trim().toUpperCase();
  if (!v) {
    return { ok: false, error: "아이디를 입력하세요." };
  }
  const m = v.match(/^U?(\d{1,9})$/);
  if (!m) {
    return { ok: false, error: `형식이 올바르지 않습니다. 예) ${CUSTOMER_ID_MIN_LABEL}` };
  }
  const num = Number.parseInt(m[1], 10);
  if (num < CUSTOMER_ID_MIN || num > CUSTOMER_ID_MAX) {
    return {
      ok: false,
      error: `${CUSTOMER_ID_MIN_LABEL} ~ ${CUSTOMER_ID_MAX_LABEL} 범위로 입력하세요.`,
    };
  }
  return { ok: true, id: `U${String(num).padStart(9, "0")}` };
}

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

// 3. [방식 선택] 테이블 선택 / 아이디 입력 중 하나를 고르는 첫 화면.
function ChoiceCard({
  onClose,
  onPickTable,
  onPickInput,
}: {
  onClose: () => void;
  onPickTable: () => void;
  onPickInput: () => void;
}): React.ReactElement {
  return (
    <View style={s.card}>
      <Text style={s.cardTitle}>로그인 방식 선택</Text>
      <Text style={s.cardSubtitle}>로그인할 회선을 어떻게 지정할지 선택하세요.</Text>
      <View style={s.choiceWrap}>
        <Pressable onPress={onPickTable} style={[s.choiceBtn, s.choicePrimary]}>
          <Text style={s.choicePrimaryTitle}>테이블 선택</Text>
          <Text style={s.choicePrimaryDesc}>회선 목록 표에서 한 행을 골라 로그인</Text>
        </Pressable>
        <Pressable onPress={onPickInput} style={[s.choiceBtn, s.choiceSecondary]}>
          <Text style={s.choiceSecondaryTitle}>아이디 입력</Text>
          <Text style={s.choiceSecondaryDesc}>회선ID를 직접 입력해 로그인</Text>
        </Pressable>
      </View>
      <Pressable onPress={onClose} style={s.cardCancel}>
        <Text style={s.cardCancelText}>닫기</Text>
      </Pressable>
    </View>
  );
}

// 4. [아이디 입력] 허용 범위 안내 + 입력 + 검증 → 확인(로그인)/취소.
function InputCard({
  value,
  error,
  submitting,
  onChangeText,
  onConfirm,
  onCancel,
}: {
  value: string;
  error: string | null;
  submitting: boolean;
  onChangeText: (t: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}): React.ReactElement {
  return (
    <View style={s.card}>
      <Text style={s.cardTitle}>아이디 입력 로그인</Text>
      <Text style={s.cardSubtitle}>
        {CUSTOMER_ID_MIN_LABEL} ~ {CUSTOMER_ID_MAX_LABEL} 까지 입력할 수 있습니다.
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onConfirm}
        placeholder={CUSTOMER_ID_MIN_LABEL}
        placeholderTextColor="#aaa"
        autoCapitalize="characters"
        autoCorrect={false}
        editable={!submitting}
        style={[s.input, !!error && s.inputError]}
        returnKeyType="done"
      />
      {error ? <Text style={s.inputErrorText}>{error}</Text> : null}
      <View style={s.cardActions}>
        <Pressable onPress={onCancel} style={[s.btn, s.btnGhost]} disabled={submitting}>
          <Text style={s.btnGhostText}>취소</Text>
        </Pressable>
        <Pressable
          onPress={onConfirm}
          disabled={submitting}
          style={[s.btn, s.btnPrimary, submitting && s.btnDisabled]}
        >
          <Text style={s.btnPrimaryText}>{submitting ? "로그인 중..." : "확인"}</Text>
        </Pressable>
      </View>
    </View>
  );
}

// 5. [모달] 방식 선택 → 테이블(목록 선택) / 입력(직접 입력) → 로그인 시 line_id 를 식별자로 주입.
export default function LoginModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}): React.ReactElement {
  const login = useVisitorLogin();
  const [mode, setMode] = useState<LoginMode>("choice");
  const [lines, setLines] = useState<TelecomLine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<TelecomLine | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [inputId, setInputId] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);

  // 모달이 열릴 때마다 방식 선택 화면으로 초기화한다(이전 상태 잔존 방지).
  useEffect(() => {
    if (!visible) {
      return;
    }
    setMode("choice");
    setSelected(null);
    setError(null);
    setInputId("");
    setInputError(null);
  }, [visible]);

  // [테이블 선택] 선택 시점에만 회선 목록을 조회한다(방식 선택 화면에서는 호출하지 않음).
  const enterTable = () => {
    setMode("table");
    setSelected(null);
    setError(null);
    setLoading(true);
    fetchTelecomLines()
      .then(setLines)
      .catch((e) => setError(String(e?.message ?? e)))
      .finally(() => setLoading(false));
  };

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

  // [아이디 입력] 검증 통과 시 입력값을 line_id 로 그대로 로그인(thirdPartyId 주입).
  const onInputConfirm = async () => {
    if (submitting) {
      return;
    }
    const result = _normalizeCustomerId(inputId);
    if (!result.ok) {
      setInputError(result.error);
      return;
    }
    setInputError(null);
    setSubmitting(true);
    try {
      await login({ lineId: result.id, customerName: "직접입력" });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  if (mode === "choice") {
    return (
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <View style={s.overlay}>
          <ChoiceCard
            onClose={onClose}
            onPickTable={enterTable}
            onPickInput={() => setMode("input")}
          />
        </View>
      </Modal>
    );
  }

  if (mode === "input") {
    return (
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <View style={s.overlay}>
          <InputCard
            value={inputId}
            error={inputError}
            submitting={submitting}
            onChangeText={(t) => {
              setInputId(t);
              if (inputError) {
                setInputError(null);
              }
            }}
            onConfirm={onInputConfirm}
            onCancel={onClose}
          />
        </View>
      </Modal>
    );
  }

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
  card: {
    width: "94%",
    maxWidth: 420,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
  },
  cardTitle: { fontSize: 18, fontWeight: "700", color: "#1A1A2E" },
  cardSubtitle: { fontSize: 13, color: "#666", marginTop: 6, lineHeight: 18 },
  choiceWrap: { marginTop: 18, gap: 12 },
  choiceBtn: { borderRadius: 10, paddingHorizontal: 16, paddingVertical: 16 },
  choicePrimary: { backgroundColor: MAGENTA },
  choicePrimaryTitle: { color: "#fff", fontSize: 16, fontWeight: "700" },
  choicePrimaryDesc: { color: "rgba(255,255,255,0.85)", fontSize: 12, marginTop: 4 },
  choiceSecondary: { backgroundColor: "#f1f1f4", borderWidth: 1, borderColor: "#e2e2ea" },
  choiceSecondaryTitle: { color: "#1A1A2E", fontSize: 16, fontWeight: "700" },
  choiceSecondaryDesc: { color: "#666", fontSize: 12, marginTop: 4 },
  cardCancel: { marginTop: 18, alignSelf: "center", paddingVertical: 8, paddingHorizontal: 12 },
  cardCancelText: { color: "#888", fontSize: 13, fontWeight: "600" },
  input: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#d6d6de",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 16,
    color: "#1A1A2E",
    backgroundColor: "#fafafd",
    letterSpacing: 1,
  },
  inputError: { borderColor: "#c0392b" },
  inputErrorText: { color: "#c0392b", fontSize: 12, marginTop: 8 },
  cardActions: { flexDirection: "row", justifyContent: "flex-end", marginTop: 20 },
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
