/**
 * adobe_frontend_example.init_native_sdk (네이티브 Adobe Mobile SDK 초기화 예시)
 * ================================================================================
 * 앱 부팅 시 1회 실행하는 **최소 초기화 코드**. Data Collection(Tags) 모바일 속성의
 * Environment File ID(appId) 하나로 SDK 를 켜면, Tags 에 설치한 확장
 * (Target/Assurance/Identity/Lifecycle/Signal/Profile)이 v7부터 자동 등록된다.
 *
 * 핵심 한 줄: `await MobileCore.initializeWithAppId(appId)`
 *
 * [설치] (이미 설치되어 있다면 생략 — 참고용)
 * ===========
 * // npm install @adobe/react-native-aepcore @adobe/react-native-aeptarget @adobe/react-native-aepassurance
 * // iOS: cd ios && pod install   /   네이티브 모듈이라 EAS 새 빌드 필요(OTA 불가)
 *
 * [Main Functions]
 * ===========
 * - initNativeAdobeSdk: appId 로 MobileCore 초기화(1회) + Property 토큰 주입(선택)
 * - startAssuranceSession: Assurance 검증 세션 시작(딥링크 URL)
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - initNativeAdobeSdk(appId, propertyToken?): Promise<boolean>
 * - startAssuranceSession(url): void
 *
 * [Dependencies]
 * =========
 * - @adobe/react-native-aepcore (MobileCore, LogLevel)
 * - @adobe/react-native-aepassurance (Assurance)
 */

import { LogLevel, MobileCore } from "@adobe/react-native-aepcore";
import { Assurance } from "@adobe/react-native-aepassurance";

// 앱 생애주기 동안 1회만 초기화하기 위한 가드 플래그.
let initialized = false;

/**
 * 1. SDK 초기화 — 앱 루트(예: App.tsx / _layout.tsx)의 첫 마운트에서 1회 호출.
 *
 *    사용 예시:
 *      useEffect(() => {
 *        void initNativeAdobeSdk(
 *          "ce8d64c4e8e1/9c6ed559c876/launch-xxxx-development",  // Environment File ID
 *          "c851da4c-8201-3d44-b91a-4dc532f7ec72",               // at_property (선택)
 *        );
 *      }, []);
 *
 *    @param appId          Tags 모바일 속성의 Environment File ID
 *    @param propertyToken  at_property 토큰(특정 Property 활동만 매칭, 선택)
 */
export async function initNativeAdobeSdk(
  appId: string,
  propertyToken?: string,
): Promise<boolean> {
  if (initialized) return true;
  if (!appId || appId.trim().length === 0) {
    console.warn("[adobe-example] initNativeAdobeSdk: appId 비어 있음 — 건너뜀");
    return false;
  }
  try {
    MobileCore.setLogLevel(LogLevel.DEBUG); // 운영에서는 ERROR 권장
    await MobileCore.initializeWithAppId(appId.trim());
    // Property 로 활동을 구획했다면 토큰을 설정해야 해당 Property 활동이 평가된다.
    if (propertyToken && propertyToken.trim().length > 0) {
      MobileCore.updateConfiguration({ "target.propertyToken": propertyToken.trim() });
    }
    initialized = true;
    return true;
  } catch (error) {
    console.warn("[adobe-example] initNativeAdobeSdk 실패:", String(error));
    return false;
  }
}

/**
 * 2. Assurance(검증) 세션 시작 — 초기화 직후 호출하면 콘솔 Assurance 에 연결돼 요청을 실시간 검증한다.
 *    URL 예시: "yourapp://?adb_validation_sessionid=xxxxxxxx-xxxx-..."
 *    (딥링크 대신 환경값으로 고정해두면 입력폼 없이 자동 연결 가능)
 */
export function startAssuranceSession(url: string): void {
  if (!url || url.trim().length === 0) return;
  try {
    Assurance.startSession(url.trim());
  } catch (error) {
    console.warn("[adobe-example] startAssuranceSession 실패:", String(error));
  }
}
