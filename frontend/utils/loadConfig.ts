/**
 * utils/loadConfig.ts (앱 설정 로드)
 * ================================================================================
 * `frontend/env/config.dev.json` / `config.prd.json` 을 __DEV__ 로 선택해 로드한다.
 * Adobe Target offers 요청의 기본 mbox 문자열은 `adobe_mboxes` 블록과 동기화한다.
 *
 * [Main Functions]
 * ===========
 * - config: 앱 전역에서 사용하는 설정 객체
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - ImageItem, AppConfig, AdobeMboxesConfig: 설정 스키마 타입
 * - config: AppConfig (env JSON)
 *
 * [Dependencies]
 * =========
 * - ../env/config.dev.json, ../env/config.prd.json
 */

import devConfig from "../env/config.dev.json";
import prdConfig from "../env/config.prd.json";

export interface ImageItem {
  id: number;
  filename: string;
  label: string;
}

/** `backend/env/config.adobe.json` 의 `mboxes` 와 동일 키를 맞춘다. */
export interface AdobeMboxesConfig {
  offer_mbox_name: string;
  bootstrap_mbox_name: string;
}

export interface AppConfig {
  port: number;
  base_url: string;
  api_url: string;
  api_base_url?: string;
  app_title: string;
  images: ImageItem[];
  api_port?: number;
  image_dir?: string;
  adobe_mboxes?: AdobeMboxesConfig;
}

// 2. __DEV__: expo start 등 개발 시 true, export·release 빌드 시 false → env JSON 고정
export const config: AppConfig = (__DEV__ ? devConfig : prdConfig) as AppConfig;
