/**
 * adobe_frontend.target_frontend.components.EventPopup (Target 이벤트 팝업 UI)
 * ================================================================================
 * Adobe Target이 `type: event-popup` JSON 오퍼를 내려줄 때만 내용을 표시한다.
 * 노출 여부는 Target이 결정하며, 오퍼가 없으면 렌더하지 않는다.
 *
 * [Main Functions]
 * ===========
 * - Modal 기반 중앙 카드·닫기 버튼
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - EventPopup: offer, onClose props
 *
 * [Dependencies]
 * =========
 * - react-native (Modal, View, Text, Pressable, Platform, StyleSheet)
 */

import React from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
} from "react-native";
import type { AdobeTargetEventPopupOffer } from "../utils/targetOfferParser";

// ── Adobe Target ──
export interface EventPopupProps {
  offer: AdobeTargetEventPopupOffer | null;
  onClose: () => void;
}

const DEFAULT_TITLE = "이벤트 대상";
const DEFAULT_BODY = "축하합니다!";
const DEFAULT_BUTTON = "확인";

// 1. 오퍼가 있을 때만 Modal을 연다.
export default function EventPopup({ offer, onClose }: EventPopupProps) {
  if (offer == null) {
    return null;
  }

  const title = offer.title?.trim() ? offer.title : DEFAULT_TITLE;
  const body = offer.body?.trim() ? offer.body : DEFAULT_BODY;
  const buttonText = offer.buttonText?.trim()
    ? offer.buttonText
    : DEFAULT_BUTTON;

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* ── Adobe Target ── 배경은 장식만; 닫기는 Primary 버튼(onClose)만 */}
      <View style={styles.backdrop} accessibilityViewIsModal>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.body}>{body}</Text>
          <Pressable
            style={styles.button}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel={buttonText}
          >
            <Text style={styles.buttonLabel}>{buttonText}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    ...(Platform.OS === "web"
      ? { boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.15)" }
      : {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 12,
        }),
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A2E",
    marginBottom: 12,
    textAlign: "center",
  },
  body: {
    fontSize: 16,
    color: "#444",
    marginBottom: 20,
    textAlign: "center",
    lineHeight: 24,
  },
  button: {
    alignSelf: "stretch",
    backgroundColor: "#4A90D9",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  buttonLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
});
