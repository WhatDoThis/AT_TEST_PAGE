/**
 * utils/digitalData.ts (웹 데이터레이어 digitalData)
 * ================================================================================
 * 웹에서 `window.digitalData.page.pageInfo.pageName` 을 라우트에 맞게 설정한다.
 * Expo Router `baseUrl`(`/at-test`) 접두는 pathname 정규화 시 제거한다.
 *
 * [Main Functions]
 * ===========
 * - setDigitalDataPageForPathname: pathname → pageName 반영
 * - getDigitalDataPageNameForPathname: pageName 조회(테스트·디버그)
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - DigitalDataLayer, PAGE_NAME_BY_ROUTE
 * - normalizeAppPathname(pathname)
 *
 * [Dependencies]
 * =========
 * - 없음(브라우저 window 전용)
 */

/** `window.digitalData` 스키마(확장 필드는 호출 측에서 병합 가능). */
export type DigitalDataLayer = {
  page: {
    pageInfo: {
      pageName: string;
    };
  };
};

/** Expo 라우트(정규화 후) → digitalData pageName */
export const PAGE_NAME_BY_ROUTE: Record<string, string> = {
  "/": "at-test",
  "/profile-test": "at-test-profile-test",
  "/recommendation-test": "at-test-recommendation-test",
};

const APP_BASE_PATH = "/at-test";

declare global {
  interface Window {
    digitalData?: DigitalDataLayer;
  }
}

// 1. pathname 에서 baseUrl·끝 슬래시를 제거한 앱 내부 경로를 만든다.
export function normalizeAppPathname(pathname: string): string {
  let p = (pathname || "/").trim();
  if (!p.startsWith("/")) {
    p = `/${p}`;
  }
  if (p.length > 1 && p.endsWith("/")) {
    p = p.slice(0, -1);
  }
  if (p === APP_BASE_PATH) {
    return "/";
  }
  if (p.startsWith(`${APP_BASE_PATH}/`)) {
    p = p.slice(APP_BASE_PATH.length);
  }
  return p || "/";
}

// 2. 정규화된 경로에 대응하는 pageName 을 반환한다.
export function getDigitalDataPageNameForPathname(pathname: string): string {
  const route = normalizeAppPathname(pathname);
  return PAGE_NAME_BY_ROUTE[route] ?? PAGE_NAME_BY_ROUTE["/"];
}

function _ensureDigitalDataShell(): DigitalDataLayer {
  if (typeof window === "undefined") {
    return { page: { pageInfo: { pageName: "" } } };
  }
  if (!window.digitalData?.page?.pageInfo) {
    window.digitalData = {
      page: {
        pageInfo: {
          pageName: "",
        },
      },
    };
  }
  return window.digitalData;
}

// 3. [웹] 현재 라우트에 맞게 `window.digitalData.page.pageInfo.pageName` 을 갱신한다.
export function setDigitalDataPageForPathname(pathname: string): string {
  const pageName = getDigitalDataPageNameForPathname(pathname);
  if (typeof window === "undefined") {
    return pageName;
  }
  const layer = _ensureDigitalDataShell();
  layer.page.pageInfo.pageName = pageName;
  return pageName;
}
