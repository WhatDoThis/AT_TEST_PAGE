/**
 * adobe_frontend.target-native-frontend.recommendationData (추천 테스트 데이터·순수 유틸)
 * ================================================================================
 * 네이티브 추천(Recommendations) 테스트 화면이 쓰는 고정 데이터와 순수 함수 모음.
 * - 고정 recipient_id 10개(데이터 적재 시 수신자별 thirdPartyId 로 사용)
 * - 메뉴 엔티티 60개(entity.id=id, categoryId=sb/sf) — 웹 RecommendationTestPanel 과 동일 카탈로그
 * - 랜덤 엔티티 선택 / 추천 응답 파싱 / 추천 항목 라벨 추출 유틸(전송·표시 로직과 분리)
 *
 * [Main Functions]
 * ===========
 * - pickRandomEntities: MENU_ENTITIES 중 중복 없이 무작위 N개(기본 2~5) — 한 주문에 묶어 보낼 품목
 * - parseRecommendations: 오퍼 콘텐츠(JSON 문자열)에서 추천 배열 추출(여러 형태 허용·미해결 토큰 제거)
 * - pickRecLabel: 추천 항목에서 표시용 라벨 추출
 * - pickRecId: 추천 항목에서 보조 표시용 entityId 추출(검증용)
 *
 * 추천 활동 디자인 출력 계약(Test Woo Star Product - Json):
 *   { meta:{...}, items:[ { entityId, name, categoryId, stCode }, ... 최대 5 ] }
 *   추천이 5개 미만이면 빈 슬롯의 토큰($entity5.id 등)이 그대로 올 수 있어 파싱 단계에서 걸러낸다.
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - RECIPIENT_IDS: string[]
 * - MenuEntity, MENU_ENTITIES: 카탈로그 타입·데이터
 * - BUNDLE_MIN / BUNDLE_MAX: 한 주문 묶음 품목 수 범위
 * - pickRandomEntities(min?, max?): MenuEntity[]
 * - parseRecommendations(raw: string): unknown[]
 * - pickRecLabel(item: unknown): string
 * - pickRecId(item: unknown): string
 *
 * [Dependencies]
 * =========
 * - 없음(순수 데이터/함수)
 */

export interface MenuEntity {
  id: string;
  code: string;
  categoryId: string;
  name: string;
  price: number;
}

/** 데이터 적재 시 순차 순회하는 고정 수신자 ID(각 요청에서 thirdPartyId 로 설정). */
export const RECIPIENT_IDS: string[] = [
  "R87766071024",
  "R19875003354",
  "R90176837855",
  "R85007869362",
  "R14601670811",
  "R49075919283",
  "R47872850717",
  "R97251432731",
  "R95409559541",
  "R48906105672",
];

/** 추천 카탈로그(웹 패널과 동일). entity.id=id, categoryId=sb(음료)/sf(푸드). */
export const MENU_ENTITIES: MenuEntity[] = [
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

/**
 * 한 주문에 묶을 품목 수 범위(co-purchase 쌍 형성용).
 * Adobe 제한(purchasedProductIds 콤마 연결 총 250자) 안쪽이며, 2~5개는 현실적 장바구니 크기.
 */
export const BUNDLE_MIN = 2;
export const BUNDLE_MAX = 5;

// 1. 무작위 엔티티 N개(중복 없이) 선택 — 한 주문에 묶어 보낼 품목. 기본 BUNDLE_MIN~BUNDLE_MAX.
export function pickRandomEntities(min: number = BUNDLE_MIN, max: number = BUNDLE_MAX): MenuEntity[] {
  const lo = Math.max(1, Math.min(min, max));
  const hi = Math.min(MENU_ENTITIES.length, Math.max(min, max));
  const count = lo + Math.floor(Math.random() * (hi - lo + 1));
  // 부분 Fisher-Yates: 앞쪽 count 개만 섞어 뽑는다(중복 없음).
  const pool = [...MENU_ENTITIES];
  for (let i = 0; i < count; i += 1) {
    const j = i + Math.floor(Math.random() * (pool.length - i));
    const tmp = pool[i];
    pool[i] = pool[j];
    pool[j] = tmp;
  }
  return pool.slice(0, count);
}

// 값이 실제로 채워졌는지(빈 문자열·미해결 토큰 "$..." 아님) 판정.
function isResolved(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0 && !v.trim().startsWith("$");
}

// 객체면 레코드로, 아니면 null — 추천 항목 필드 탐색의 공통 진입점(반복 캐스팅 제거).
function toRecord(item: unknown): Record<string, unknown> | null {
  return item && typeof item === "object" ? (item as Record<string, unknown>) : null;
}

// 추천 항목으로 유효한지 — entityId/name/id/entityName 중 하나라도 실제 값이면 채워진 슬롯으로 본다.
function hasUsefulValue(item: unknown): boolean {
  const o = toRecord(item);
  if (!o) {
    return isResolved(item);
  }
  return isResolved(o.entityId) || isResolved(o.name) || isResolved(o.id) || isResolved(o.entityName);
}

// 2. 추천 응답 파싱 — 디자인 템플릿에 따라 형태가 달라 여러 케이스를 허용(실패 시 빈 배열).
//    허용: [items...] | { items:[...] } | { content:{ items:[...] } } | { recommendations:[...] }
//    추천 부족 시 채워지지 않은 빈/토큰 슬롯은 제거한다.
export function parseRecommendations(raw: string): unknown[] {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(trimmed);
    let list: unknown[] = [];
    const o = toRecord(parsed);
    if (Array.isArray(parsed)) {
      list = parsed;
    } else if (o) {
      const content = toRecord(o.content);
      if (Array.isArray(o.items)) {
        list = o.items;
      } else if (Array.isArray(o.recommendations)) {
        list = o.recommendations;
      } else if (content && Array.isArray(content.items)) {
        list = content.items;
      }
    }
    return list.filter(hasUsefulValue);
  } catch {
    return [];
  }
}

// 3. 추천 항목 표시 라벨 — name/entityName/entity.name/entityId/id 순으로 탐색(토큰·빈값 제외).
export function pickRecLabel(item: unknown): string {
  const o = toRecord(item);
  if (!o) {
    return isResolved(item) ? item : "추천 대기중...";
  }
  const entity = toRecord(o.entity);
  const candidates = [o.name, o.entityName, entity?.name, o.entityId, o.id, entity?.id];
  const found = candidates.find(isResolved);
  return isResolved(found) ? found : "추천 대기중...";
}

// 4. 추천 항목 보조 표시(entityId) — 검증용. 없으면 빈 문자열.
export function pickRecId(item: unknown): string {
  const o = toRecord(item);
  if (!o) {
    return "";
  }
  const entity = toRecord(o.entity);
  const found = [o.entityId, o.id, entity?.id].find(isResolved);
  return isResolved(found) ? `id:${found}` : "";
}
