/**
 * app/+html.tsx (웹 루트 HTML 셸 — 단일 출력 SPA)
 * ================================================================================
 * Expo Router 웹 빌드에서 생성되는 루트 index.html 의 <head>/<body> 를 커스터마이즈한다.
 * GA4/GTM 이 하는 것과 동일하게 `window.dataLayer` 를 "가장 먼저" 초기화하고,
 * 그 아래에 Adobe Tags(Launch) 임베드 코드가 들어갈 자리를 주석으로만 확보한다.
 * (Adobe Tags 스크립트는 이 작업과 별개로 추가될 예정 → dataLayer 초기화보다 반드시 아래.)
 * 이 파일은 웹 전용이며 서버(정적) 렌더 시점에 1회 셸로 사용된다.
 *
 * [Main Functions]
 * ===========
 * - dataLayer 초기화 스크립트를 <head> 최상단(Adobe Tags 보다 위)에 삽입
 * - Adobe Tags 임베드 코드 위치를 주석으로 확보(로드 순서 고정)
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

// 1. 웹 루트 문서 — <head> 안에서 dataLayer → (Adobe Tags 자리) → 스타일 순서를 고정한다.
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

        {/* 2순위) Adobe Tags(Launch) 임베드 코드 자리 — 실제 스크립트는 추후 추가.
            반드시 위 dataLayer 초기화 아래, 아래 스타일보다 위에 위치시킬 것.
            예: <script src="//assets.adobedtm.com/xxxxx/launch-xxxxx.min.js" async></script> */}

        {/* 3순위) Expo Router 웹 스크롤 스타일 리셋 */}
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
