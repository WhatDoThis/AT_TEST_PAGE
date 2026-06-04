/**
 * utils/loadConfig.ts (앱 설정 로드)
 * ================================================================================
 * `frontend/env/config.dev.json` / `config.prd.json` 을 __DEV__ 로 선택해 로드한다.
 * 모바일(네이티브 SDK) 전용 값은 모두 `mobile_env` 블록으로 묶어 web/공용 값과 명확히 구분한다.
 *   - `mobile_env.adobe_mobile_app_id`: Data Collection(Tags) 모바일 속성의 Environment File ID(SDK 초기화)
 *   - `mobile_env.adobe_target_property_token`: Target Property(at_property) 토큰(특정 Property 활동 매칭)
 *   - `mobile_env.adobe_sdk_mboxes`: 네이티브 SDK 전용 mbox 이름 블록(웹 백엔드는 backend/env/config.adobe.json 사용)
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
  /** 버튼('오퍼 가져오기')으로 호출하는 개별 오퍼 mbox. */
  offer_sdk_mbox_name: string;
  /** 첫 로드 시 자동 호출하는 global mbox(웹 bootstrap 역할). AB 활동을 이 mbox 에 할당해 페이지 진입 시 적용. */
  global_sdk_mbox_name?: string;
}

/** 모바일(네이티브 SDK) 전용 환경값 묶음. web/공용 값과 명확히 구분하기 위해 별도 블록으로 분리한다. */
export interface MobileEnvConfig {
  /** Data Collection(Tags) 모바일 속성의 Environment File ID. 네이티브 전용 SDK 초기화에 사용(웹은 미사용). */
  adobe_mobile_app_id?: string;
  /** Adobe Target Property 토큰(at_property). 활동을 특정 Property 로 구획한 경우 모바일 요청에 실어 매칭시킨다(네이티브 전용). */
  adobe_target_property_token?: string;
  /** Assurance 검증 세션 딥링크 URL. 앱 init 시 전역 1회 자동 시작(property/workspace 가 하나일 때 고정값으로 사용). */
  assurance_session_url?: string;
  /** Assurance 세션 PIN. SDK API 로 전달되지 않고 앱 내 PIN 입력 화면에서 사용자가 입력하는 참고값. */
  assurance_session_pin?: string;
  /** 네이티브(모바일 SDK) 전용 mbox 이름 블록. 웹 백엔드 mbox 와 무관. */
  adobe_sdk_mboxes?: AdobeSdkMboxesConfig;
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
  /** 모바일(네이티브 SDK) 전용 환경값 묶음. 웹/공용 값과 구분. */
  mobile_env?: MobileEnvConfig;
}

// 2. __DEV__: expo start 등 개발 시 true, export·release 빌드 시 false → env JSON 고정
export const config: AppConfig = (__DEV__ ? devConfig : prdConfig) as AppConfig;
