/**
 * app/scroll-test.tsx (스크롤 이벤트 테스트 라우트 — /at-test/scroll-test)
 * ================================================================================
 * Adobe Target 스크롤 이벤트 테스트 전용 화면. 1부터 500까지 숫자를 세로로 나열해
 * 화면보다 내용이 길어지게 하고, 상하 스크롤이 발생하도록 한다. 각 숫자 오른쪽에는
 * 그 숫자가 화면 상단에 올 때 스크롤이 상단에서 몇 퍼센트 내려왔는지를 표시한다.
 * 목록은 화면 중앙에 정렬한다.
 *
 * [Main Functions]
 * ===========
 * - ScrollTestScreen: 1~500 숫자 + 행별 스크롤 퍼센트를 중앙 정렬 스크롤로 표시
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - ScrollTestScreen: /scroll-test 화면
 *
 * [Dependencies]
 * =========
 * - react
 * - react-native
 */

import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from "react-native";

// 스크롤 길이·퍼센트 계산용 상수(행 높이를 고정해 위치를 정확히 계산한다)
const COUNT = 500;
const ROW_HEIGHT = 34;
const CONTENT_PADDING_V = 20;
const NUMBERS = Array.from({ length: COUNT }, (_, i) => i + 1);

// 1. 1~500 숫자를 세로로 나열하고, 각 행이 상단에 올 때의 스크롤 퍼센트를 우측에 표시한다.
export default function ScrollTestScreen(): React.ReactElement {
  const [viewportHeight, setViewportHeight] = useState(0);

  // 전체 콘텐츠 높이와 최대 스크롤 가능량으로 행별 퍼센트를 산출한다.
  const contentHeight = CONTENT_PADDING_V * 2 + COUNT * ROW_HEIGHT;
  const maxScroll = Math.max(contentHeight - viewportHeight, 1);

  const onLayout = (e: LayoutChangeEvent) => {
    setViewportHeight(e.nativeEvent.layout.height);
  };

  return (
    <ScrollView
      nativeID="scrollTestScrollArea"
      style={styles.container}
      contentContainerStyle={styles.content}
      onLayout={onLayout}
    >
      {NUMBERS.map((n, i) => {
        const rowTop = CONTENT_PADDING_V + i * ROW_HEIGHT;
        const percent = Math.min(100, Math.max(0, (rowTop / maxScroll) * 100));
        return (
          <View key={n} style={styles.row}>
            <Text style={styles.number}>{n}</Text>
            <Text style={styles.percent}>{percent.toFixed(1)}%</Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  content: {
    paddingVertical: CONTENT_PADDING_V,
    alignItems: "center",
  },
  row: {
    height: ROW_HEIGHT,
    width: 220,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  number: {
    fontSize: 20,
    color: "#1A1A2E",
  },
  percent: {
    fontSize: 16,
    color: "#4A90D9",
    fontWeight: "600",
  },
});
