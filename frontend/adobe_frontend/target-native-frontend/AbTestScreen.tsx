/**
 * adobe_frontend.target-native-frontend.AbTestScreen (네이티브 Target A/B 이미지 테스트 화면)
 * ================================================================================
 * 페이지 진입 시 global mbox(common.GLOBAL_MBOX)를 1회 호출해 받은 JSON 오퍼(주요 내용: imageUrl)를 처리한다.
 * mbox 는 config 값만 사용하며 미설정이면 빈 문자열 그대로 두어 SupportBanner 가 누락을 경고한다.
 * 중앙은 두 이미지를 한 라인에 나란히 둔다 — 왼쪽은 항상 기본(default.png, 대조군),
 * 오른쪽은 Target 활동이 내려준 오퍼 이미지(URL). 어떤 이미지든 라인 폭에 맞춰 자동 크기 조정한다.
 * 요소별 전용 파서 없이 "오퍼 JSON 의 imageUrl" 단일 계약만 사용한다.
 * 라우트 파일(app/abtest.tsx)에서 이 컴포넌트를 default 로 re-export 한다.
 *
 * [Main Functions]
 * ===========
 * - AbTestScreen: 진입 시 global mbox 호출 → 좌(기본)/우(오퍼) 이미지 비교 표시 / 다시 불러오기 / 초기화
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - AbTestScreen(): React.ReactElement
 *
 * [Dependencies]
 * =========
 * - react, react-native
 * - @/utils/imageMap (getImage — 기본 이미지 default.png)
 * - ./native/adobeMobileTarget (retrieveTargetContent / isAdobeMobileTargetSupported)
 * - ./common (GLOBAL_MBOX, SupportBanner, commonStyles)
 */

import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { getImage } from "@/utils/imageMap";
import {
  isAdobeMobileTargetSupported,
  retrieveTargetContent,
} from "./native/adobeMobileTarget";
import { GLOBAL_MBOX, SupportBanner, commonStyles as c } from "./common";

// 오퍼 없음을 구분하기 위한 기본 콘텐츠(빈 문자열).
const DEFAULT_CONTENT = "";

// 오퍼 JSON 문자열에서 imageUrl 만 안전하게 추출(전용 파서 없이 단일 계약). 실패/없음이면 null.
function extractImageUrl(raw: string): string | null {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) {
    return null;
  }
  try {
    const parsed = JSON.parse(trimmed) as { imageUrl?: unknown };
    return typeof parsed.imageUrl === "string" && parsed.imageUrl.trim().length > 0
      ? parsed.imageUrl.trim()
      : null;
  } catch {
    return null;
  }
}

export default function AbTestScreen(): React.ReactElement {
  const supported = isAdobeMobileTargetSupported();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [rawOffer, setRawOffer] = useState("");
  const [loading, setLoading] = useState(false);

  // 1. global mbox 호출 → 오른쪽 이미지(오퍼)에 반영. mbox 미설정/웹이면 스킵.
  const loadOffer = useCallback(async () => {
    if (!supported || !GLOBAL_MBOX) {
      return;
    }
    setLoading(true);
    try {
      const raw = await retrieveTargetContent(GLOBAL_MBOX, DEFAULT_CONTENT);
      setRawOffer(raw);
      setImageUrl(extractImageUrl(raw));
    } finally {
      setLoading(false);
    }
  }, [supported]);

  // 2. 첫 로드 시 1회 자동 호출.
  useEffect(() => {
    void loadOffer();
  }, [loadOffer]);

  // 3. 초기화(오른쪽도 비움).
  const onReset = useCallback(() => {
    setImageUrl(null);
    setRawOffer("");
  }, []);

  return (
    <ScrollView style={c.container} contentContainerStyle={c.content}>
      <Text style={c.title}>네이티브 Target A/B 테스트</Text>

      <SupportBanner
        supported={supported}
        mbox={GLOBAL_MBOX}
        readyText="네이티브 SDK 사용 가능 — global mbox 오퍼로 이미지가 분배됩니다."
      />

      {/* 친절 안내: 진입 시 자동 오퍼 적용 + 좌/우 의미 설명 */}
      <View style={s.infoBox}>
        <Text style={s.infoText}>
          이 화면은 진입하는 순간 자동으로 Target global mbox 오퍼를 가져옵니다.{"\n"}
          • 왼쪽: 앱에 내장된 기본 이미지(대조군, 항상 동일){"\n"}
          • 오른쪽: Target 활동(A/B)이 내려준 오퍼의 이미지 URL{"\n"}
          같은 사용자라도 활동의 50/50 분배에 따라 오른쪽 이미지가 달라질 수 있습니다.
        </Text>
      </View>

      {/* 중앙: 좌(기본) / 우(오퍼) 2열. 각 이미지는 칸 폭에 맞춰 자동 크기(contain). */}
      <View style={s.row}>
        <View style={s.col}>
          <Text style={s.colLabel}>기본(대조군)</Text>
          <View style={s.imageBox}>
            <Image source={getImage("default.png")} style={s.image} resizeMode="contain" />
          </View>
        </View>
        <View style={s.col}>
          <Text style={s.colLabel}>오퍼(Target)</Text>
          <View style={s.imageBox}>
            {imageUrl ? (
              <Image
                source={{ uri: imageUrl }}
                style={s.image}
                resizeMode="contain"
                onError={() => setImageUrl(null)}
              />
            ) : (
              <Text style={s.placeholder}>{loading ? "불러오는 중…" : "(오퍼 없음)"}</Text>
            )}
          </View>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [c.btn, pressed && c.btnPressed]}
        onPress={loadOffer}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={c.btnText}>다시 불러오기</Text>
        )}
      </Pressable>

      <Text style={c.label}>받은 오퍼(JSON)</Text>
      <View style={c.resultBox}>
        <Text style={c.resultText}>{rawOffer || "(아직 없음)"}</Text>
      </View>

      <Pressable
        style={({ pressed }) => [c.btnSecondary, pressed && c.btnPressed]}
        onPress={onReset}
      >
        <Text style={c.btnSecondaryText}>초기화</Text>
      </Pressable>
    </ScrollView>
  );
}

// 이 화면 고유 스타일만 정의(공용은 common.commonStyles).
const s = StyleSheet.create({
  infoBox: {
    backgroundColor: "#EEF4FB",
    borderColor: "#C7DBF2",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 4,
  },
  infoText: { fontSize: 12.5, color: "#33475B", lineHeight: 19 },
  row: { flexDirection: "row", gap: 10, marginTop: 8 },
  col: { flex: 1 },
  colLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#555",
    textAlign: "center",
    marginBottom: 4,
  },
  imageBox: {
    borderWidth: 1,
    borderColor: "#E1E5EA",
    borderRadius: 8,
    backgroundColor: "#fff",
    height: 150,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  image: { width: "100%", height: "100%" },
  placeholder: { fontSize: 12, color: "#9AA5B1" },
});
