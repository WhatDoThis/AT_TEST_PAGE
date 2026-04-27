/**
 * utils/imageMap.ts (정적 이미지 require 매핑)
 * ================================================================================
 * Metro 번들러는 require 경로가 정적이어야 하므로 filename→모듈 매핑을 유지한다. 새 파일은 여기에 한 줄 추가한다.
 *
 * [Main Functions]
 * ===========
 * - getImage: filename으로 Image source 반환
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - getImage(filename: string): ImageSourcePropType 호환 값
 *
 * [Dependencies]
 * =========
 * - react-native ImageSourcePropType
 * - ../assets/images/*.png
 */

import type { ImageSourcePropType } from "react-native";

const DEFAULT_FILENAME = "default.png";

// 1. [매핑] config.images[].filename과 동일한 키를 유지한다.
const imageMap: Record<string, ImageSourcePropType> = {
  "default.png": require("../assets/images/default.png"),
  "img_02.png": require("../assets/images/img_02.png"),
  "img_03.png": require("../assets/images/img_03.png"),
};

// 2. filename으로 소스 조회, 없으면 기본 이미지
export const getImage = (filename: string): ImageSourcePropType => {
  const resolved = imageMap[filename];
  if (resolved) {
    return resolved;
  }
  return imageMap[DEFAULT_FILENAME];
};
