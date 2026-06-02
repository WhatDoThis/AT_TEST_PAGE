/**
 * utils/loadConfig.ts (앱 설정 로드)
 * ================================================================================
 * `frontend/env/config.dev.json` / `config.prd.json` 을 __DEV__ 로 선택해 로드한다.
 * `adobe_sdk_mboxes` 는 네이티브(모바일 SDK) 전용 mbox 이름 블록이다(웹 백엔드는 backend/env/config.adobe.json 사용).
 * `adobe_mobile_app_id` 는 네이티브 앱의 Adobe Mobile SDK 초기화용 Environment File ID 다.
 *
 * [Main Functions]
 * ===========
 * - config: 앱 전역에서 사용하는 설정 객체
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - ImageItem, AppConfig, AdobeSdkMboxesConfig: 설정 스키마 타입
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

/** 네이티브(모바일 SDK) 전용 mbox 이름. 백엔드 웹 SDK 의 `config.adobe.json mboxes` 와 구분한다. */
export interface AdobeSdkMboxesConfig {
  offer_sdk_mbox_name: string;
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
  /** 네이티브(모바일 SDK) 전용 mbox 이름 블록. 웹 백엔드 mbox 와 무관. */
  adobe_sdk_mboxes?: AdobeSdkMboxesConfig;
  /** Data Collection(Tags) 모바일 속성의 Environment File ID. 네이티브 전용 SDK 초기화에 사용(웹은 미사용). */
  adobe_mobile_app_id?: string;
}

// 2. __DEV__: expo start 등 개발 시 true, export·release 빌드 시 false → env JSON 고정
export const config: AppConfig = (__DEV__ ? devConfig : prdConfig) as AppConfig;
