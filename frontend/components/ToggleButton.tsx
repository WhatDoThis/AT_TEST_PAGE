/**
 * components/ToggleButton.tsx (갤러리 영역 토글 버튼)
 * ================================================================================
 * 이미지 목록 카드 영역의 보이기·감추기를 전환한다. 접근성 라벨을 제공한다.
 *
 * [Main Functions]
 * ===========
 * - 토글 버튼 렌더 및 onToggle 호출
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - ToggleButton: Pressable 기반 토글 UI
 *
 * [Dependencies]
 * =========
 * - react-native
 */

import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";

interface ToggleButtonProps {
  isOpen: boolean;
  onToggle: () => void;
}

// 1. 갤러리 열림/닫힘에 따라 라벨·접근성 힌트를 바꾼다.
export default function ToggleButton({ isOpen, onToggle }: ToggleButtonProps) {
  const label = isOpen ? "이미지 목록 감추기" : "이미지 목록 보이기";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.buttonPressed,
      ]}
      onPress={onToggle}
    >
      <Text style={styles.buttonText}>
        {isOpen ? "▲ 이미지 목록 감추기" : "▼ 이미지 목록 보이기"}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 12,
    backgroundColor: "#6C63FF",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignSelf: "center",
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
