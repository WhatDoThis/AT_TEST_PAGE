/**
 * adobe_frontend.target-native-frontend.XtTestScreen (네이티브 Target XT 테스트 화면)
 * ================================================================================
 * 네이티브 앱에서 Adobe Mobile SDK(AEPTarget)로 offer mbox 콘텐츠를 조회하는 테스트 화면.
 * mbox 는 입력폼 없이 `config.mobile_env.adobe_sdk_mboxes.offer_sdk_mbox_name`(common.OFFER_MBOX)만 사용한다.
 * 미설정이면 빈 문자열 그대로 사용해 SupportBanner 가 누락을 경고한다(하드코딩 폴백 없음).
 * Assurance 세션은 화면이 아니라 앱 init(targetApp)에서 환경변수로 전역 1회 적용한다.
 * 반환 오퍼가 event-popup JSON 이면 웹과 동일한 EventPopup 모달을 띄운다.
 * 라우트 파일(app/xttest.tsx)에서 이 컴포넌트를 default 로 re-export 한다.
 *
 * [Main Functions]
 * ===========
 * - XtTestScreen: XT 테스트(offer mbox 조회) / 반환 콘텐츠 / 방문자 식별자 / 경험 초기화 / event-popup
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - XtTestScreen(): React.ReactElement
 *
 * [Dependencies]
 * =========
 * - react, react-native
 * - @/components/EventPopup (웹과 공용 팝업 UI)
 * - ./native/adobeMobileTarget (네이티브 SDK 래퍼)
 * - @adobe/utils/targetOfferParser (parseAdobeTargetEventPopupContent)
 * - ./common (OFFER_MBOX, SupportBanner, commonStyles)
 */

import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import EventPopup from "@/components/EventPopup";
import {
  getTargetIds,
  isAdobeMobileTargetSupported,
  resetTargetExperience,
  retrieveTargetContent,
} from "./native/adobeMobileTarget";
import type { TargetIds } from "./native/adobeMobileTarget.types";
import {
  parseAdobeTargetEventPopupContent,
  type AdobeTargetEventPopupOffer,
} from "@adobe/utils/targetOfferParser";
import { OFFER_MBOX, SupportBanner, commonStyles as c } from "./common";

// 활동/오퍼 미세팅 상태를 식별하기 위한 기본 콘텐츠(오퍼 없으면 이 값이 그대로 반환됨).
const DEFAULT_CONTENT = "default-content";
const EMPTY_IDS: TargetIds = { tntId: null, thirdPartyId: null, sessionId: null };

export default function XtTestScreen(): React.ReactElement {
  const supported = isAdobeMobileTargetSupported();
  const [content, setContent] = useState("");
  const [ids, setIds] = useState<TargetIds>(EMPTY_IDS);
  const [loading, setLoading] = useState(false);
  const [eventPopupOffer, setEventPopupOffer] =
    useState<AdobeTargetEventPopupOffer | null>(null);

  // 1. offer mbox 콘텐츠 조회 + ID 갱신 + (AT) event-popup 오퍼 감지
  const onRetrieve = useCallback(async () => {
    setLoading(true);
    try {
      const result = await retrieveTargetContent(OFFER_MBOX, DEFAULT_CONTENT);
      setContent(result);
      // (AT) event-popup JSON 오퍼면 웹과 동일한 EventPopup 표시(아니면 null).
      setEventPopupOffer(parseAdobeTargetEventPopupContent(result));
      setIds(await getTargetIds());
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. 방문자 식별자만 조회
  const onRefreshIds = useCallback(async () => {
    setIds(await getTargetIds());
  }, []);

  // 3. 경험 초기화(식별자 제거)
  const onReset = useCallback(() => {
    resetTargetExperience();
    setIds(EMPTY_IDS);
    setContent("");
    setEventPopupOffer(null);
  }, []);

  return (
    <ScrollView style={c.container} contentContainerStyle={c.content}>
      <Text style={c.title}>네이티브 Target XT 테스트</Text>

      <SupportBanner
        supported={supported}
        mbox={OFFER_MBOX}
        readyText={`네이티브 SDK 사용 가능 — mbox "${OFFER_MBOX}" 오퍼를 조회합니다.`}
      />

      <Pressable
        style={({ pressed }) => [c.btn, pressed && c.btnPressed]}
        onPress={onRetrieve}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={c.btnText}>XT 테스트</Text>
        )}
      </Pressable>

      <Text style={c.label}>반환 콘텐츠</Text>
      <View style={c.resultBox}>
        <Text style={c.resultText}>{content || "(아직 없음)"}</Text>
      </View>

      <Text style={c.label}>방문자 식별자</Text>
      <View style={c.resultBox}>
        <Text style={s.idText}>tntId: {ids.tntId ?? "-"}</Text>
        <Text style={s.idText}>thirdPartyId: {ids.thirdPartyId ?? "-"}</Text>
        <Text style={s.idText}>sessionId: {ids.sessionId ?? "-"}</Text>
      </View>
      <Pressable
        style={({ pressed }) => [c.btnSecondary, pressed && c.btnPressed]}
        onPress={onRefreshIds}
      >
        <Text style={c.btnSecondaryText}>ID 새로고침</Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [s.btnDanger, pressed && c.btnPressed]}
        onPress={onReset}
      >
        <Text style={c.btnText}>경험 초기화(식별자 제거)</Text>
      </Pressable>

      {/* (AT) event-popup 오퍼일 때만 모달 표시(offer=null 이면 미렌더). */}
      <EventPopup offer={eventPopupOffer} onClose={() => setEventPopupOffer(null)} />
    </ScrollView>
  );
}

// 이 화면 고유 스타일만 정의(공용은 common.commonStyles).
const s = StyleSheet.create({
  idText: { fontSize: 13, color: "#333", marginVertical: 1 },
  btnDanger: {
    backgroundColor: "#D93025",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 20,
  },
});
