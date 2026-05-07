/**
 * utils/loadConfig.ts (앱 설정 로드)
 * ================================================================================
 * `frontend/env/config.dev.json` / `config.prd.json` 을 __DEV__ 로 선택해 로드한다.
 * Adobe Target mbox 이름은 **`frontend/env/config.adobe.json`**(로컬 전용, Git 미추적)을 정적 임포트해
 * `config.adobe_target` 으로 병합한다. 저장소에는 **`frontend/env/config.adobe.example.json`** 만 있으며,
 * `npm install` 의 `postinstall` 이 `config.adobe.json` 이 없을 때 example 을 복사해 만든다.
 * `config.adobe.json` 은 루트에 `offer_mbox_name`·`track_mbox_name` 을 두거나, `mboxes` 객체 안에 둘 수 있다.
 *
 * [Main Functions]
 * ===========
 * - normalizeAdobeTarget: 평면·mboxes 중첩 JSON → AdobeTargetConfig
 * - config: 앱 전역에서 사용하는 설정 객체
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - ImageItem, AdobeTargetConfig, AppConfig: 설정 스키마 타입
 * - config: AppConfig (env JSON + adobe 병합; adobe 는 로컬 config.adobe.json)
 *
 * [Dependencies]
 * =========
 * - ../env/config.dev.json, ../env/config.prd.json
 * - ../env/config.adobe.json (`frontend/env/config.adobe.json`, 없으면 postinstall 이 example 에서 생성)
 * - ../env/config.adobe.example.json (템플릿, Git 추적)
 */

import devConfig from "../env/config.dev.json";
import prdConfig from "../env/config.prd.json";

// ════════════════════════════════════════════════════════════════════════════════
// [BRIDGE · Adobe] 구분선 — 위: 앱 env(dev/prd) / 아래: Adobe 공통 JSON 단독 로드
// ── 파일: 런타임 `frontend/env/config.adobe.json`(Git 미추적) · 템플릿 `config.adobe.example.json`
// ── 런타임: Metro 번들 시 정적 import → `adobeTargetJson` 으로 합침
// ════════════════════════════════════════════════════════════════════════════════
import adobeTargetJson from "../env/config.adobe.json";
// ════════════════════════════════════════════════════════════════════════════════
// [BRIDGE · Adobe] JSON 임포트 끝 — 이하 타입·export 에서 `adobe_target` 필드로 사용
// ════════════════════════════════════════════════════════════════════════════════

export interface ImageItem {
  id: number;
  filename: string;
  label: string;
}

/** [BRIDGE · Adobe] 런타임에 노출되는 mbox 설정(원본 JSON은 평면 또는 `mboxes` 중첩) */
export interface AdobeTargetConfig {
  offer_mbox_name: string;
  track_mbox_name: string;
}

type AdobeRaw = Record<string, unknown>;

// 1. [BRIDGE · Adobe] `frontend/env/config.adobe.json` — 루트 키 또는 `mboxes` 하위 키 지원
function normalizeAdobeTarget(raw: AdobeRaw): AdobeTargetConfig {
  const rootOffer = typeof raw.offer_mbox_name === "string" ? raw.offer_mbox_name : "";
  const rootTrack = typeof raw.track_mbox_name === "string" ? raw.track_mbox_name : "";
  const mboxes = raw.mboxes;
  if (mboxes && typeof mboxes === "object" && !Array.isArray(mboxes)) {
    const m = mboxes as Record<string, unknown>;
    const o = typeof m.offer_mbox_name === "string" ? m.offer_mbox_name : rootOffer;
    const t = typeof m.track_mbox_name === "string" ? m.track_mbox_name : rootTrack;
    return {
      offer_mbox_name: o.trim(),
      track_mbox_name: t.trim(),
    };
  }
  return {
    offer_mbox_name: rootOffer.trim(),
    track_mbox_name: rootTrack.trim(),
  };
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
  /** [BRIDGE · Adobe] 출처: `frontend/env/config.adobe.json` (로컬, `normalizeAdobeTarget` 병합) */
  adobe_target: AdobeTargetConfig;
}

// 2. __DEV__: expo start 등 개발 시 true, export·release 빌드 시 false → env JSON 고정
const base = (__DEV__ ? devConfig : prdConfig) as Omit<AppConfig, "adobe_target">;

// ════════════════════════════════════════════════════════════════════════════════
// [BRIDGE · Adobe] `config` 최종 조립 — `adobe_target` 은 로컬 `frontend/env/config.adobe.json`
// ════════════════════════════════════════════════════════════════════════════════
export const config: AppConfig = {
  ...base,
  adobe_target: normalizeAdobeTarget(adobeTargetJson as AdobeRaw),
};
// ════════════════════════════════════════════════════════════════════════════════
// [BRIDGE · Adobe] 조립 끝
// ════════════════════════════════════════════════════════════════════════════════
