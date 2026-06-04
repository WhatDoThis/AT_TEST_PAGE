/**
 * adobe_frontend.target-native-frontend.native.adobeMobileTarget.types (네이티브 Target SDK 공용 타입)
 * ================================================================================
 * 웹(no-op)·네이티브 구현이 공유하는 타입 정의. 두 구현(`adobeMobileTarget.ts` / `.native.ts`)이
 * 동일 시그니처를 유지하도록 타입만 한곳에 모은다.
 *
 * [Main Functions]
 * ===========
 * - (타입 전용) TargetIds
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - TargetIds: tntId/thirdPartyId/sessionId
 * - RecommendationData: 추천 학습 데이터 전송 페이로드
 *
 * [Dependencies]
 * =========
 * - 없음
 */

/** Adobe Target 방문자 식별자(없으면 null). */
export type TargetIds = {
  tntId: string | null;
  thirdPartyId: string | null;
  sessionId: string | null;
};

/**
 * 추천 학습 데이터(구매) 전송 페이로드.
 * 한 주문에 여러 품목을 묶어 보내 co-purchase 쌍을 더 빨리 형성한다(purchasedProductIds).
 * entity.*(대표 1개)는 카탈로그 갱신용, order.purchasedProductIds 는 구매 학습용으로 쓰인다.
 */
export type RecommendationData = {
  /** 수신자 식별자(thirdPartyId 로 설정해 방문자 구분). */
  thirdPartyId: string;
  /** 대표 품목(entity.* 파라미터용) — 보통 묶음의 첫 품목. */
  entityId: string;
  categoryId: string;
  entityName: string;
  /** 주문 합계 금액(묶음 단가 합). */
  total: number;
  /**
   * 구매 품목 id 묶음(=entity.id). Adobe 제한: 개당 50자, 콤마 연결 총 250자 이하.
   */
  purchasedProductIds: string[];
};
