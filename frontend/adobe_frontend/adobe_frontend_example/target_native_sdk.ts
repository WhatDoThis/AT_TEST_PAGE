/**
 * adobe_frontend_example.target_native_sdk (네이티브 Target 호출 예시)
 * ================================================================================
 * 초기화(init_native_sdk) 이후, Adobe 객체 빌더(base_model_native_sdk)를 이용해
 * 실제 Target 호출(콘텐츠 조회 / 식별자 / 추천 학습)을 수행하는 **최소 사용 예시**.
 *
 * 콜백 기반 SDK 라 조회는 Promise 로 감싸 async/await 로 쓰게 한다.
 *
 * [Main Functions]
 * ===========
 * - retrieveContent: 단일 mbox 콘텐츠 조회(콜백 → Promise)
 * - getVisitorIds: tntId/thirdPartyId/sessionId 조회
 * - setVisitor / resetVisitor: 방문자(thirdPartyId) 지정 / 전체 ID 재발급
 * - sendRecommendationData: 추천 학습용 구매 이벤트 전송
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - retrieveContent(mboxName, defaultContent, mboxParameters?): Promise<string>
 * - getVisitorIds(): Promise<{tntId,thirdPartyId,sessionId}>
 * - setVisitor(thirdPartyId): void   /   resetVisitor(): void
 * - sendRecommendationData(mboxName, thirdPartyId, payload): void
 *
 * [Dependencies]
 * =========
 * - @adobe/react-native-aepcore (MobileCore)
 * - @adobe/react-native-aeptarget (Target, TargetParameters, TargetRequestObject)
 * - ./base_model_native_sdk (Adobe 객체 빌더)
 */

import { MobileCore } from "@adobe/react-native-aepcore";
import { Target, TargetParameters, TargetRequestObject } from "@adobe/react-native-aeptarget";

import {
  buildOrder,
  buildParameters,
  buildProduct,
  type RecommendationPayload,
} from "./base_model_native_sdk";

/**
 * 1. [기본] 단일 mbox 콘텐츠 조회.
 *    activity 가 없으면 defaultContent 가 그대로 반환된다(폴백).
 *
 *    사용 예시:
 *      const raw = await retrieveContent("target-msdk-mbox", "{}");
 *      // 활동(JSON 오퍼)이 매칭되면 raw 예: '{"imageUrl":"https://.../b.png"}'
 *      const offer = JSON.parse(raw);
 *
 *    @returns 매칭 시 오퍼 콘텐츠(문자열), 없으면 defaultContent
 */
export function retrieveContent(
  mboxName: string,
  defaultContent: string,
  mboxParameters?: Record<string, string>,
): Promise<string> {
  return new Promise<string>((resolve) => {
    try {
      const parameters = new TargetParameters(mboxParameters ?? {});
      const request = new TargetRequestObject(
        mboxName,
        parameters,
        defaultContent,
        (error, content) => {
          if (error) {
            console.warn("[adobe-example] retrieveContent 오류:", String(error));
            resolve(defaultContent);
            return;
          }
          resolve(content ?? defaultContent);
        },
      );
      // 배열로 여러 mbox 를 한 번에 요청할 수도 있다([req1, req2, ...]).
      Target.retrieveLocationContent([request], parameters);
    } catch (error) {
      console.warn("[adobe-example] retrieveContent 예외:", String(error));
      resolve(defaultContent);
    }
  });
}

/**
 * 2. 방문자 식별자 조회 — 화면에 표시하거나 디버깅에 사용.
 *    반환 예시: { tntId: "12345.35_0", thirdPartyId: "R8776...", sessionId: "..." }
 */
export async function getVisitorIds(): Promise<{
  tntId: string | null;
  thirdPartyId: string | null;
  sessionId: string | null;
}> {
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
    console.warn("[adobe-example] getVisitorIds 실패:", String(error));
    return { tntId: null, thirdPartyId: null, sessionId: null };
  }
}

/**
 * 3. 방문자 지정 — CRM 키(thirdPartyId)로 프로필을 고정한다.
 *    resetExperience 가 thirdPartyId 까지 비우므로 "reset → set" 순서가 중요.
 */
export function setVisitor(thirdPartyId: string): void {
  try {
    Target.resetExperience();
    const id = (thirdPartyId ?? "").trim();
    if (id.length > 0) Target.setThirdPartyId(id);
  } catch (error) {
    console.warn("[adobe-example] setVisitor 실패:", String(error));
  }
}

/**
 * 4. 방문자 전체 초기화 — tntId + ECID 까지 재발급해 "완전한 새 방문자"로 만든다.
 *    A/B 재추첨 테스트에 사용(resetExperience 만으로는 ECID 가 남아 같은 배정이 복원됨).
 */
export function resetVisitor(): void {
  try {
    Target.resetExperience();
    MobileCore.resetIdentities();
  } catch (error) {
    console.warn("[adobe-example] resetVisitor 실패:", String(error));
  }
}

/**
 * 5. [추천] 학습 데이터(구매 이벤트) 전송 — 응답은 쓰지 않고 적재 목적.
 *    "People Who Bought This, Bought That" 은 order.purchasedProductIds(=entity.id) 로 학습된다.
 *    한 주문에 여러 품목을 묶어 보내면 co-purchase 쌍이 빨리 쌓인다.
 *
 *    사용 예시(1초 간격으로 수신자 순회하며 호출):
 *      sendRecommendationData("target-rec-msdk-mbox", "R8776...", {
 *        entityId: "21", categoryId: "sb", entitiesTotalValue: 4500,
 *        purchasedProductIds: ["21", "37", "08"],
 *      });
 */
export function sendRecommendationData(
  mboxName: string,
  thirdPartyId: string,
  payload: RecommendationPayload,
): void {
  try {
    setVisitor(thirdPartyId);
    const orderId = `ord_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const productIds =
      payload.purchasedProductIds.length > 0 ? payload.purchasedProductIds : [payload.entityId];
    const mboxParams: Record<string, string> = {
      "entity.id": payload.entityId,
      "entity.categoryId": payload.categoryId,
      ...(payload.entityAttrs ?? {}),
    };
    // entity.value = 단건 품목 가격(주문 총액과 다름). 소수점만 허용(콤마 X).
    if (payload.entityValue !== undefined && payload.entityValue > 0) {
      mboxParams["entity.value"] = payload.entityValue.toFixed(2);
    }
    const parameters = buildParameters(
      mboxParams,
      payload.profileParams,
      buildProduct(payload.entityId, payload.categoryId),
      buildOrder(orderId, payload.entitiesTotalValue, productIds),
    );
    const request = new TargetRequestObject(mboxName, parameters, "", () => {});
    Target.retrieveLocationContent([request], parameters);
  } catch (error) {
    console.warn("[adobe-example] sendRecommendationData 실패:", String(error));
  }
}
