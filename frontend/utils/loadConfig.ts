/**
 * utils/loadConfig.ts (앱 설정 로드)
 * ================================================================================
 * 루트 env의 config.dev.json / config.prd.json을 로드한다. Expo가 제공하는 __DEV__로 개발·프로덕션 번들을 구분한다.
 *
 * [Main Functions]
 * ===========
 * - config: 앱 전역에서 사용하는 설정 객체
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - ImageItem, AppConfig: 설정 스키마 타입(api_url·선택 api_port)
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
  api_port?: number;
  api_url: string;
  image_dir: string;
  app_title: string;
  images: ImageItem[];
}

// 1. __DEV__: expo start 등 개발 시 true, export·release 빌드 시 false → 환경별 JSON 고정
export const config: AppConfig = (__DEV__ ? devConfig : prdConfig) as AppConfig;
