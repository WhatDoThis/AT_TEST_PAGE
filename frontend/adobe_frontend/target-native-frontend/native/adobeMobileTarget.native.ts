/**
 * adobe_frontend.target-native-frontend.native.adobeMobileTarget (네이티브 구현 · iOS/Android)
 * ================================================================================
 * Adobe Experience Platform Mobile SDK를 이용해 네이티브 앱에서 Adobe Target을 호출한다.
 * Data Collection(Tags) 모바일 속성의 Environment File ID(appId)로 SDK를 초기화하면
 * v7부터 설치된 확장(Target/Assurance/Identity/Lifecycle/Signal/Profile)이 자동 등록된다.
 * Metro는 네이티브 플랫폼에서 이 `.native.ts` 파일을 선택하고, 웹은 base `adobeMobileTarget.ts`
 * (no-op)를 선택하므로 웹 번들에는 네이티브 패키지가 포함되지 않는다.
 *
 * [Main Functions]
 * ===========
 * - isAdobeMobileTargetSupported: 네이티브에서 항상 true
 * - initAdobeMobileTarget: appId로 MobileCore 초기화(1회) + Property 토큰 주입(선택)
 * - retrieveTargetContent: 단일 mbox 콘텐츠 조회(콜백 → Promise 래핑)
 * - getTargetIds: tntId/thirdPartyId/sessionId 조회
 * - resetTargetExperience: 방문자 식별자 초기화
 * - startAssuranceSession: Assurance 검증 세션 시작
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - isAdobeMobileTargetSupported(): boolean
 * - initAdobeMobileTarget(appId, propertyToken?): Promise<boolean>
 * - retrieveTargetContent(mboxName, defaultContent, mboxParameters?): Promise<string>
 * - getTargetIds(): Promise<TargetIds>
 * - resetTargetExperience(): void
 * - startAssuranceSession(url): void
 *
 * [Dependencies]
 * =========
 * - @adobe/react-native-aepcore (MobileCore, LogLevel)
 * - @adobe/react-native-aeptarget (Target, TargetParameters, TargetRequestObject)
 * - @adobe/react-native-aepassurance (Assurance)
 * - ./adobeMobileTarget.types (공용 타입)
 */

import { LogLevel, MobileCore } from "@adobe/react-native-aepcore";
import { Assurance } from "@adobe/react-native-aepassurance";
import {
  Target,
  TargetParameters,
  TargetRequestObject,
} from "@adobe/react-native-aeptarget";

import type { TargetIds } from "./adobeMobileTarget.types";

// 초기화 중복 방지 플래그(앱 생애주기 동안 1회)
let initialized = false;

// 1. 지원 여부 — 네이티브는 항상 true
export function isAdobeMobileTargetSupported(): boolean {
  return true;
}

// 2. 초기화 — appId(Environment File ID)로 SDK 구성, v7은 확장 자동 등록
//    propertyToken 이 있으면 target.propertyToken 으로 주입해 특정 Property 활동만 매칭되게 한다.
export async function initAdobeMobileTarget(
  appId: string,
  propertyToken?: string
): Promise<boolean> {
  // 이미 초기화됐거나 appId가 비어있으면 조기 반환(가드 클로즈)
  if (initialized) {
    return true;
  }
  if (!appId || appId.trim().length === 0) {
    console.warn("[adobeMobileTarget] initAdobeMobileTarget: appId가 비어 있어 초기화를 건너뜀");
    return false;
  }
  try {
    MobileCore.setLogLevel(LogLevel.DEBUG);
    await MobileCore.initializeWithAppId(appId.trim());
    // (AT) Target 활동을 특정 Property 로 구획한 경우, 모바일 요청에 at_property 토큰이 실려야
    //      해당 Property 의 활동이 평가된다. 토큰이 없으면 생략(전체 평가).
    if (propertyToken && propertyToken.trim().length > 0) {
      MobileCore.updateConfiguration({ "target.propertyToken": propertyToken.trim() });
    }
    initialized = true;
    return true;
  } catch (error) {
    console.warn("[adobeMobileTarget] initAdobeMobileTarget 실패:", String(error));
    return false;
  }
}

// 3. mbox 콘텐츠 조회 — TargetRequestObject 콜백을 Promise로 래핑
export function retrieveTargetContent(
  mboxName: string,
  defaultContent: string,
  mboxParameters?: Record<string, string>
): Promise<string> {
  return new Promise<string>((resolve) => {
    try {
      const parameters = new TargetParameters(mboxParameters ?? {});
      const request = new TargetRequestObject(
        mboxName,
        parameters,
        defaultContent,
        (error, content) => {
          // 콜백 오류 시 기본 콘텐츠로 폴백
          if (error) {
            console.warn("[adobeMobileTarget] retrieveTargetContent 콜백 오류:", String(error));
            resolve(defaultContent);
            return;
          }
          resolve(content ?? defaultContent);
        }
      );
      Target.retrieveLocationContent([request], parameters);
    } catch (error) {
      console.warn("[adobeMobileTarget] retrieveTargetContent 예외:", String(error));
      resolve(defaultContent);
    }
  });
}

// 4. 방문자 식별자 조회
export async function getTargetIds(): Promise<TargetIds> {
  try {
    const [tntId, thirdPartyId, sessionId] = await Promise.all([
      Target.getTntId(),
      Target.getThirdPartyId(),
      Target.getSessionId(),
    ]);
    return {
      tntId: tntId ?? null,
      thirdPartyId: thirdPartyId ?? null,
      sessionId: sessionId ?? null,
    };
  } catch (error) {
    console.warn("[adobeMobileTarget] getTargetIds 실패:", String(error));
    return { tntId: null, thirdPartyId: null, sessionId: null };
  }
}

// 5. 방문자 식별자 초기화
export function resetTargetExperience(): void {
  try {
    Target.resetExperience();
  } catch (error) {
    console.warn("[adobeMobileTarget] resetTargetExperience 실패:", String(error));
  }
}

// 6. Assurance 검증 세션 시작
export function startAssuranceSession(url: string): void {
  // 빈 URL 가드
  if (!url || url.trim().length === 0) {
    return;
  }
  try {
    Assurance.startSession(url.trim());
  } catch (error) {
    console.warn("[adobeMobileTarget] startAssuranceSession 실패:", String(error));
  }
}
