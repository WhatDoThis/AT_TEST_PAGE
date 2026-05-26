/**
 * app/index.tsx (앱 루트 — /at-test/ → /main 리다이렉트)
 * ================================================================================
 * 배포 baseUrl(`/at-test`) 루트 접근 시 메인 화면 경로(`/main`)로 보낸다.
 *
 * [Main Functions]
 * ===========
 * - IndexRedirect: `<Redirect href="/main" />`
 *
 * [Dependencies]
 * =========
 * - expo-router (Redirect)
 */

import { Redirect, type Href } from "expo-router";

const MAIN_HREF = "/main" as Href;

export default function IndexRedirect() {
  return <Redirect href={MAIN_HREF} />;
}
