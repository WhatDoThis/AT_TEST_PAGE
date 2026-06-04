/**
 * adobe_frontend.target-native-frontend.native.adobeMobileTarget (웹 기본 구현 · no-op)
 * ================================================================================
 * Adobe Mobile SDK(AEPCore/AEPTarget/AEPAssurance)는 네이티브 전용이라 웹 번들에서는
 * 절대 import 되면 안 된다. Metro가 네이티브에서는 `adobeMobileTarget.native.ts`,
 * 웹에서는 확장자 없는 이 파일(`.ts`)을 선택한다(웹은 `.web.ts`가 없으면 base `.ts`로 폴백).
 * 따라서 이 파일은 네이티브 패키지를 전혀 import 하지 않는 안전한 no-op이며, TypeScript의
 * 타입 소스도 겸한다. 웹은 기존 FastAPI 프록시 경로(targetOffersFetch 등)를 그대로 사용한다.
 *
 * [Main Functions]
 * ===========
 * - isAdobeMobileTargetSupported: 현재 플랫폼에서 네이티브 SDK 사용 가능 여부(웹=false)
 * - initAdobeMobileTarget: SDK 초기화(웹=no-op)
 * - retrieveTargetContent: mbox 콘텐츠 조회(웹=defaultContent 반환)
 * - getTargetIds: 방문자 식별자 조회(웹=null)
 * - resetTargetExperience: 방문자 식별자 초기화(웹=no-op)
 * - setTargetVisitor: 추천 데이터용 방문자 구분(웹=no-op)
 * - sendTargetRecommendationData: 추천 학습 데이터 전송(웹=no-op)
 * - startAssuranceSession: Assurance 세션 시작(웹=no-op)
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - isAdobeMobileTargetSupported(): boolean
 * - initAdobeMobileTarget(appId, propertyToken?): Promise<boolean>
 * - retrieveTargetContent(mboxName, defaultContent, mboxParameters?): Promise<string>
 * - getTargetIds(): Promise<TargetIds>
 * - resetTargetExperience(): void
 * - setTargetVisitor(thirdPartyId): void
 * - sendTargetRecommendationData(mboxName, data): void
 * - startAssuranceSession(url): void
 *
 * [Dependencies]
 * =========
 * - ./adobeMobileTarget.types (공용 타입)
 */

import type { TargetIds, RecommendationData } from "./adobeMobileTarget.types";

// 1. 지원 여부 — 웹은 네이티브 SDK 미사용
export function isAdobeMobileTargetSupported(): boolean {
  return false;
}

// 2. 초기화 — 웹은 no-op (propertyToken 시그니처만 네이티브와 맞춘다)
export async function initAdobeMobileTarget(
  _appId: string,
  _propertyToken?: string
): Promise<boolean> {
  return false;
}

// 3. mbox 콘텐츠 조회 — 웹은 기본값 그대로 반환(웹은 프록시 경로 사용)
export async function retrieveTargetContent(
  _mboxName: string,
  defaultContent: string,
  _mboxParameters?: Record<string, string>
): Promise<string> {
  return defaultContent;
}

// 4. 방문자 식별자 조회 — 웹은 값 없음
export async function getTargetIds(): Promise<TargetIds> {
  return { tntId: null, thirdPartyId: null, sessionId: null };
}

// 5. 방문자 식별자 초기화 — 웹은 no-op
export function resetTargetExperience(): void {}

// 6. 추천 데이터용 방문자 구분 — 웹은 no-op
export function setTargetVisitor(_thirdPartyId: string): void {}

// 7. 추천 학습 데이터 전송 — 웹은 no-op
export function sendTargetRecommendationData(
  _mboxName: string,
  _data: RecommendationData
): void {}

// 8. Assurance 세션 시작 — 웹은 no-op
export function startAssuranceSession(_url: string): void {}
