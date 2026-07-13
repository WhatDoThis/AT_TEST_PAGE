/**
 * app/+html.tsx (웹 루트 HTML 셸 — 단일 출력 SPA)
 * ================================================================================
 * Expo Router 웹 빌드에서 생성되는 루트 index.html 의 <head>/<body> 를 커스터마이즈한다.
 * GA4/GTM 이 하는 것과 동일하게 `window.dataLayer` 를 "가장 먼저" 초기화하고,
 * 그 바로 아래에서 Adobe Tags(Launch) dev 환경 임베드 스크립트를 async 로 로드한다.
 * (dataLayer 인라인 스크립트는 파싱 즉시 동기 실행되므로, async 인 Launch 가 실행될 때는
 *  window.dataLayer 가 이미 존재한다 → Google Data Layer Extension 이 안전하게 읽는다.)
 * 이 파일은 웹 전용이며 서버(정적) 렌더 시점에 1회 셸로 사용된다.
 *
 * [Main Functions]
 * ===========
 * - dataLayer 초기화 스크립트를 <head> 최상단(Adobe Tags 보다 위)에 삽입
 * - Adobe Tags(Launch) dev 임베드 스크립트를 dataLayer 초기화 직후 async 로드
 * - Expo Router 웹 기본 스타일 리셋 적용
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - Root: 웹 루트 HTML 문서
 *
 * [Dependencies]
 * =========
 * - expo-router/html (ScrollViewStyleReset)
 * - react
 */

import { ScrollViewStyleReset } from "expo-router/html";
import { type PropsWithChildren } from "react";

// GA4/GTM 이 하는 것과 동일한 dataLayer 초기화(Adobe Tags 보다 반드시 위에서 실행).
const DATA_LAYER_INIT = "window.dataLayer = window.dataLayer || [];";

// Adobe Tags(Launch) dev 환경 임베드 스크립트(공통 태깅). 운영 배포 시 production URL 로 교체.
const ADOBE_TAGS_SRC =
  "https://assets.adobedtm.com/ce8d64c4e8e1/628ae2bdae74/launch-eff6fb8763ac-development.min.js";

// 1. 웹 루트 문서 — <head> 안에서 dataLayer → Adobe Tags(Launch) → 스타일 순서를 고정한다.
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="ko">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />

        {/* 1순위) dataLayer 초기화 (가장 먼저 — Adobe Tags 임베드 코드보다 위) */}
        <script dangerouslySetInnerHTML={{ __html: DATA_LAYER_INIT }} />

        {/* 2순위) Adobe Tags(Launch) dev 임베드 — dataLayer 초기화 직후 async 로드 */}
        <script src={ADOBE_TAGS_SRC} async />

        {/* 3순위) Expo Router 웹 스크롤 스타일 리셋 */}
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
