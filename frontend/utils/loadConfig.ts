/**
 * utils/loadConfig.ts (앱 설정 로드)
 * ================================================================================
 * 루트 env의 config.dev.json / config.prd.json 중 하나를 로드한다. EXPO_PUBLIC_CONFIG_PROFILE이 prd이면 prd, 아니면 dev.
 *
 * [Main Functions]
 * ===========
 * - config: 앱 전역에서 사용하는 설정 객체
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - ImageItem, AppConfig: 설정 스키마 타입
 * - config: AppConfig (JSON 내용)
 *
 * [Dependencies]
 * =========
 * - ../../env/config.dev.json, ../../env/config.prd.json
 */

import devConfig from "../../env/config.dev.json";
import prdConfig from "../../env/config.prd.json";

export interface ImageItem {
  id: number;
  filename: string;
  label: string;
}

export interface AppConfig {
  port: number;
  base_url: string;
  image_dir: string;
  app_title: string;
  images: ImageItem[];
  api_url?: string;
}

// 1. 빌드 타임에 프로필에 맞는 JSON을 고른다. 기본은 dev.
const profile = process.env.EXPO_PUBLIC_CONFIG_PROFILE;
const raw = profile === "prd" ? prdConfig : devConfig;

export const config: AppConfig = raw as AppConfig;
