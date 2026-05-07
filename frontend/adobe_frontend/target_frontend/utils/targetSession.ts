/**
 * adobe_frontend.target_frontend.utils.targetSession (웹 sessionStorage 기반 Adobe Target 방문자 식별자)
 * ================================================================================
 * 오퍼 프리로드와 이미지 캐러셀 트래킹이 동일 `tnt_id` / `visitor_id`를 쓰도록 키·조회 로직을 한곳에 둔다.
 *
 * [Main Functions]
 * ===========
 * - getAdobeTargetVisitorPayload: 다음 Target API 요청 JSON에 넣을 `tnt_id`·`visitor_id` 조각
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - 상수 AT_TNT_STORAGE_KEY, AT_VISITOR_STORAGE_KEY
 *
 * [Dependencies]
 * =========
 * - 브라우저 sessionStorage (웹 전용 호출부에서만 사용)
 */

// ════════════════════════════════════════════════════════════════════════════════
// ████████  ADOBE TARGET 전용 파일 — 전체 코드가 Adobe Target 연동용  ████████
// ════════════════════════════════════════════════════════════════════════════════

export const AT_TNT_STORAGE_KEY = "at_tnt_id";
export const AT_VISITOR_STORAGE_KEY = "at_visitor_third_party_id";

// 1. sessionStorage에서 offers 응답으로 저장된 식별자를 읽어 track/offers 본문에 병합한다.
export function getAdobeTargetVisitorPayload(): { tnt_id?: string; visitor_id?: string } {
  if (typeof sessionStorage === "undefined") {
    return {};
  }
  const tnt = sessionStorage.getItem(AT_TNT_STORAGE_KEY)?.trim();
  if (tnt) {
    return { tnt_id: tnt };
  }
  const visitor = sessionStorage.getItem(AT_VISITOR_STORAGE_KEY)?.trim();
  if (visitor) {
    return { visitor_id: visitor };
  }
  return {};
}
