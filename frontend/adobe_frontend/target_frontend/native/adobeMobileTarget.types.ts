/**
 * adobe_frontend.target_frontend.native.adobeMobileTarget.types (네이티브 Target SDK 공용 타입)
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
