/**
 * adobe_frontend.target_frontend.components.RecommendationTestPanel (Recommendations 테스트 UI)
 * ================================================================================
 * Adobe Target Recommendations 검증용 패널. fetch 는 동일 이름 접두의 `utils/targetRecommendationTest` 와 짝을 이룬다.
 * 음료(sb)·푸드(sf) 엔티티 버튼만 배치한다(장소 카테고리 `ss` 는 본 테스트 범위에서 제외).
 *
 * [Main Functions]
 * ===========
 * - RecommendationTestPanel: 엔티티 그리드·추천 슬롯·fetch 연동
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - RecommendationTestPanel(): React.ReactElement
 * - pickRecLabel(rec): 추천 항목 표시용 라벨
 *
 * [Dependencies]
 * =========
 * - react, react-native
 * - ../utils/targetRecommendationTest (sendRecommendationTest)
 * - ../utils/targetSession (AT_RECS_RECIPIENT_ID_KEY)
 * - ../utils/sessionStore (웹/네이티브 범용 세션 저장소)
 */

import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { sendRecommendationTest } from "../utils/targetRecommendationTest";
import { AT_RECS_RECIPIENT_ID_KEY } from "../utils/targetSession";
import { sessionGetItem, sessionSetItem } from "../utils/sessionStore";

interface MenuEntity {
  id: string;
  code: string;
  categoryId: string;
  name: string;
  price: number;
}

const MENU_ENTITIES: MenuEntity[] = [
  { id: "21", code: "st_sb_001", categoryId: "sb", name: "cafe_americano", price: 1000 },
  { id: "22", code: "st_sb_002", categoryId: "sb", name: "cafe_latte", price: 1000 },
  { id: "23", code: "st_sb_003", categoryId: "sb", name: "black_glazed_latte", price: 1000 },
  { id: "24", code: "st_sb_004", categoryId: "sb", name: "decaf_cafe_americano", price: 1000 },
  { id: "25", code: "st_sb_005", categoryId: "sb", name: "vanilla_cream_cold_brew", price: 1000 },
  { id: "26", code: "st_sb_006", categoryId: "sb", name: "grapefruit_honey_black_tea", price: 1000 },
  { id: "27", code: "st_sb_007", categoryId: "sb", name: "starbucks_dolce_latte", price: 1000 },
  { id: "28", code: "st_sb_008", categoryId: "sb", name: "cold_brew", price: 1000 },
  { id: "29", code: "st_sb_009", categoryId: "sb", name: "iced_grapefruit_honey_black_tea", price: 1000 },
  { id: "30", code: "st_sb_010", categoryId: "sb", name: "matcha_glazed_latte", price: 1000 },
  { id: "31", code: "st_sb_011", categoryId: "sb", name: "caramel_macchiato", price: 1000 },
  { id: "32", code: "st_sb_012", categoryId: "sb", name: "jeju_organic_matcha_latte", price: 1000 },
  { id: "33", code: "st_sb_013", categoryId: "sb", name: "vanilla_flat_white", price: 1000 },
  { id: "34", code: "st_sb_014", categoryId: "sb", name: "strawberry_delight", price: 1000 },
  { id: "35", code: "st_sb_015", categoryId: "sb", name: "iced_cafe_mocha", price: 1000 },
  { id: "36", code: "st_sb_016", categoryId: "sb", name: "yuzu_mint_tea", price: 1000 },
  { id: "37", code: "st_sb_017", categoryId: "sb", name: "mango_banana_blended", price: 1000 },
  { id: "38", code: "st_sb_018", categoryId: "sb", name: "oat_milk_latte", price: 1000 },
  { id: "39", code: "st_sb_019", categoryId: "sb", name: "espresso_con_panna", price: 1000 },
  { id: "40", code: "st_sb_020", categoryId: "sb", name: "java_chip_frappuccino", price: 1000 },
  { id: "41", code: "st_sf_001", categoryId: "sf", name: "sausage_egg_morning_muffin", price: 1000 },
  { id: "42", code: "st_sf_002", categoryId: "sf", name: "blt_sandwich", price: 1000 },
  { id: "43", code: "st_sf_003", categoryId: "sf", name: "basil_chicken_sandwich", price: 1000 },
  { id: "44", code: "st_sf_004", categoryId: "sf", name: "croissant", price: 1000 },
  { id: "45", code: "st_sf_005", categoryId: "sf", name: "blueberry_cheese_cake", price: 1000 },
  { id: "46", code: "st_sf_006", categoryId: "sf", name: "cheese_potato_bread", price: 1000 },
  { id: "47", code: "st_sf_007", categoryId: "sf", name: "croque_monsieur", price: 1000 },
  { id: "48", code: "st_sf_008", categoryId: "sf", name: "new_york_cheese_cake", price: 1000 },
  { id: "49", code: "st_sf_009", categoryId: "sf", name: "bacon_caesar_chicken_sandwich", price: 1000 },
  { id: "50", code: "st_sf_010", categoryId: "sf", name: "castella_cream_egg_sandwich", price: 1000 },
  { id: "51", code: "st_sf_011", categoryId: "sf", name: "mini_donut_4pcs", price: 1000 },
  { id: "52", code: "st_sf_012", categoryId: "sf", name: "egg_tart", price: 1000 },
  { id: "53", code: "st_sf_013", categoryId: "sf", name: "sweet_potato_cake", price: 1000 },
  { id: "54", code: "st_sf_014", categoryId: "sf", name: "tiramisu", price: 1000 },
  { id: "55", code: "st_sf_015", categoryId: "sf", name: "truffle_mushroom_soup", price: 1000 },
  { id: "56", code: "st_sf_016", categoryId: "sf", name: "canele", price: 1000 },
  { id: "57", code: "st_sf_017", categoryId: "sf", name: "oat_cookie", price: 1000 },
  { id: "58", code: "st_sf_018", categoryId: "sf", name: "choco_brownie", price: 1000 },
  { id: "59", code: "st_sf_019", categoryId: "sf", name: "sweet_pumpkin_cheese_cake", price: 1000 },
  { id: "60", code: "st_sf_020", categoryId: "sf", name: "nine_layer_ganache_cake", price: 1000 },
];

const CATEGORY_LABELS: Record<string, string> = {
  sb: "Beverage (음료)",
  sf: "Food (푸드)",
};

const CATEGORY_ORDER = ["sb", "sf"] as const;

function pickRecLabel(item: unknown): string {
  if (!item || typeof item !== "object") {
    return "추천 대기중...";
  }
  const o = item as Record<string, unknown>;
  const raw = o.name ?? o.entityName;
  if (typeof raw === "string" && raw.trim()) {
    return raw;
  }
  return "추천 대기중...";
}

function readInitialRecipient(): string {
  return sessionGetItem(AT_RECS_RECIPIENT_ID_KEY)?.trim() ?? "";
}

export default function RecommendationTestPanel(): React.ReactElement {
  const [recipientId, setRecipientId] = useState<string>(readInitialRecipient);
  const [selectedEntity, setSelectedEntity] = useState<MenuEntity | null>(null);
  const [recommendations, setRecommendations] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(false);
  const [responseJson, setResponseJson] = useState<string>("");
  const [status, setStatus] = useState<string>("대기 중");
  const [jsonOpen, setJsonOpen] = useState(true);

  const byCategory = useMemo(() => {
    const m: Record<string, MenuEntity[]> = { sb: [], sf: [] };
    for (const e of MENU_ENTITIES) {
      (m[e.categoryId] ??= []).push(e);
    }
    return m;
  }, []);

  const onRecipientChange = useCallback((t: string) => {
    setRecipientId(t);
    sessionSetItem(AT_RECS_RECIPIENT_ID_KEY, t);
  }, []);

  const handleEntityClick = useCallback(
    async (entity: MenuEntity) => {
      if (!recipientId.trim()) {
        setStatus("recipient_id를 입력하세요");
        return;
      }
      setSelectedEntity(entity);
      setLoading(true);
      setStatus("전송 중...");

      try {
        const data = await sendRecommendationTest({
          entityId: entity.id,
          entityCategoryId: entity.categoryId,
          recipientId: recipientId.trim(),
          price: entity.price,
        });
        setResponseJson(JSON.stringify(data, null, 2));
        const st = data.status;
        const stNum = typeof st === "number" ? st : 200;
        setStatus(`응답 완료 (${stNum})`);

        const recs = Array.isArray(data.recommendations) ? data.recommendations : [];
        setRecommendations(recs.slice(0, 5));
      } catch (err) {
        setStatus(`에러: ${(err as Error).message}`);
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    },
    [recipientId],
  );

  const slots = useMemo(() => {
    const out: (unknown | null)[] = [null, null, null, null, null];
    recommendations.forEach((r, i) => {
      if (i < 5) {
        out[i] = r;
      }
    });
    return out;
  }, [recommendations]);

  return (
    <View style={s.container}>
      <Text style={s.title}>Recommendation Test</Text>

      <Text style={s.label}>recipient_id</Text>
      <TextInput
        style={s.input}
        placeholder="recipient_id 입력"
        placeholderTextColor="#8899A8"
        value={recipientId}
        onChangeText={onRecipientChange}
        autoCapitalize="none"
        autoCorrect={false}
      />

      {CATEGORY_ORDER.map((cat) => (
        <View key={cat} style={s.catSection}>
          <Text style={s.catTitle}>{CATEGORY_LABELS[cat] ?? cat}</Text>
          <View style={s.gridRow}>
            {(byCategory[cat] ?? []).map((entity) => {
              const sel = selectedEntity?.id === entity.id;
              return (
                <View key={entity.id} style={s.cell}>
                  <Pressable
                    style={[s.entityBtn, sel && s.entityBtnSel]}
                    onPress={() => void handleEntityClick(entity)}
                    disabled={loading}
                  >
                    <Text style={s.entityName} numberOfLines={3}>
                      {entity.name}
                    </Text>
                  </Pressable>
                  <Text style={s.priceTxt}>₩{entity.price.toLocaleString()}</Text>
                </View>
              );
            })}
          </View>
        </View>
      ))}

      <Text style={s.label}>선택된 메뉴</Text>
      <Text style={s.summary}>
        {selectedEntity
          ? `${selectedEntity.name} (id: ${selectedEntity.id})`
          : "없음 — 버튼을 눌러 선택하세요"}
      </Text>

      <Text style={s.label}>추천 메뉴 (Top 5)</Text>
      <View style={s.recRow}>
        {slots.map((slot, idx) => (
          <View key={idx} style={s.recSlot}>
            <Text style={s.recIdx}>{idx + 1}</Text>
            <Text style={s.recName} numberOfLines={4}>
              {slot != null ? pickRecLabel(slot) : "추천 대기중..."}
            </Text>
          </View>
        ))}
      </View>

      <View style={s.statusRow}>
        {loading && <ActivityIndicator size="small" color="#4A90D9" />}
        <Text style={s.statusTxt}>{status}</Text>
      </View>

      <Pressable onPress={() => setJsonOpen((v) => !v)} style={s.jsonToggle}>
        <Text style={s.jsonToggleTxt}>{jsonOpen ? "▼" : "▶"} 서버 응답 JSON</Text>
      </Pressable>
      {jsonOpen ? (
        <ScrollView style={s.resultBox}>
          <Text style={s.resultTxt} selectable>
            {responseJson || "아직 응답 없음"}
          </Text>
        </ScrollView>
      ) : null}
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
  title: { fontSize: 16, fontWeight: "700", color: "#222", marginBottom: 12 },
  label: { fontSize: 12, fontWeight: "600", color: "#444", marginTop: 10, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: "#CCD3DB",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: "#222",
    backgroundColor: "#FAFBFC",
  },
  catSection: { marginTop: 14 },
  catTitle: { fontSize: 13, fontWeight: "700", color: "#333", marginBottom: 8 },
  gridRow: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: -4 },
  cell: { width: "16.666%", padding: 4, alignItems: "center" },
  entityBtn: {
    width: "100%",
    minHeight: 52,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#DDE1E6",
    backgroundColor: "#F5F7FA",
    justifyContent: "center",
    alignItems: "center",
  },
  entityBtnSel: {
    backgroundColor: "#E3F2FD",
    borderColor: "#2196F3",
  },
  entityName: { fontSize: 9, color: "#222", textAlign: "center" },
  priceTxt: { fontSize: 9, color: "#666", marginTop: 2 },
  summary: { fontSize: 13, color: "#333" },
  recRow: { flexDirection: "row", flexWrap: "nowrap", gap: 6, justifyContent: "space-between" },
  recSlot: {
    flex: 1,
    minWidth: 0,
    minHeight: 88,
    borderWidth: 1,
    borderColor: "#CCD3DB",
    borderRadius: 6,
    padding: 6,
    backgroundColor: "#FAFBFC",
    alignItems: "center",
  },
  recIdx: { fontSize: 11, fontWeight: "700", color: "#4A90D9", marginBottom: 4 },
  recName: { fontSize: 10, color: "#333", textAlign: "center" },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12 },
  statusTxt: { color: "#333", fontSize: 12, flex: 1 },
  jsonToggle: { marginTop: 12, paddingVertical: 6 },
  jsonToggleTxt: { fontSize: 12, fontWeight: "600", color: "#4A90D9" },
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
