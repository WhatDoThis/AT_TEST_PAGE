/**
 * components/ImageGallery.tsx (이미지 전체보기 카드)
 * ================================================================================
 * config 기반 썸네일·라벨을 표시하고, 선택 시 캐러셀 인덱스와 동기화한다 (PRD FR-06). 한 줄 고정·번호만 선택 표시.
 *
 * [Main Functions]
 * ===========
 * - 이미지 한 줄 행 렌더(줄바꿈 없음)
 * - 카드 선택 시 onSelectIndex 통지, 선택 강조는 번호 영역만
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - ImageGallery: isVisible, selectedIndex, onSelectIndex props
 *
 * [Dependencies]
 * =========
 * - react-native
 * - @/utils/loadConfig
 * - @/utils/imageMap
 */

import React from "react";
import {
  View,
  Image,
  Text,
  StyleSheet,
  useWindowDimensions,
  Pressable,
} from "react-native";
import { config } from "@/utils/loadConfig";
import { getImage } from "@/utils/imageMap";

const GAP = 12;
const CARD_PADDING = 16;

interface ImageGalleryProps {
  isVisible: boolean;
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
}

// 2. 카드 그리드: 토글 시 본문만 숨기고 헤더는 유지한다.
export default function ImageGallery({
  isVisible,
  selectedIndex,
  onSelectIndex,
}: ImageGalleryProps) {
  const { width } = useWindowDimensions();
  const cardOuterWidth = Math.min(width - 40, 540);
  const innerWidth = cardOuterWidth - CARD_PADDING * 2;
  const images = config.images;
  const count = images.length;
  const safeCount = count > 0 ? count : 1;
  const itemWidth =
    (innerWidth - GAP * Math.max(0, safeCount - 1)) / safeCount;

  return (
    <View style={[styles.card, { width: cardOuterWidth }]}>
      <Text style={styles.cardTitle}>이미지 전체보기</Text>

      {isVisible && count > 0 && (
        <View style={[styles.row, { width: innerWidth }]}>
          {images.map((img, index) => {
            const selected = index === selectedIndex;
            return (
              <Pressable
                key={img.id}
                accessibilityRole="button"
                accessibilityLabel={`${img.label} 보기`}
                accessibilityState={{ selected }}
                onPress={() => onSelectIndex(index)}
                style={[styles.item, { width: itemWidth }]}
              >
                <Text
                  style={[styles.number, selected && styles.numberSelected]}
                >
                  {index + 1}.
                </Text>
                <Image
                  source={getImage(img.filename)}
                  style={[
                    styles.thumb,
                    { width: itemWidth, height: itemWidth * 0.7 },
                  ]}
                  resizeMode="cover"
                />
                <Text style={styles.label} numberOfLines={2}>
                  {img.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: CARD_PADDING,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A2E",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    flexWrap: "nowrap",
    alignSelf: "center",
    gap: GAP,
  },
  item: {
    alignItems: "center",
    minWidth: 0,
    paddingBottom: 4,
  },
  number: {
    fontSize: 14,
    fontWeight: "600",
    color: "#888",
    marginBottom: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: "hidden",
  },
  numberSelected: {
    color: "#fff",
    backgroundColor: "#4A90D9",
    fontWeight: "700",
  },
  thumb: {
    borderRadius: 8,
    backgroundColor: "#e0e0e0",
  },
  label: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    textAlign: "center",
    paddingHorizontal: 2,
  },
});
