/**
 * app/xttest.tsx (라우트 래퍼 — /xttest)
 * ================================================================================
 * Expo Router 라우트는 app/ 하위에 있어야 하므로, 실제 화면 구현은
 * adobe_frontend/target-native-frontend/XtTestScreen 으로 이관하고 여기서 default 만 re-export 한다.
 *
 * [Dependencies]
 * =========
 * - @adobe-native/XtTestScreen
 */

export { default } from "@adobe-native/XtTestScreen";
