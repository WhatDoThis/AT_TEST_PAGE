/**
 * components/DigitalDataSync.tsx (웹 digitalData 라우트 동기화)
 * ================================================================================
 * Expo Router pathname 변경 시 `window.digitalData` pageName 을 갱신한다.
 *
 * [Main Functions]
 * ===========
 * - DigitalDataSync: 웹 전용, pathname 구독 후 digitalData 반영
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - DigitalDataSync()
 *
 * [Dependencies]
 * =========
 * - expo-router (usePathname)
 * - react-native Platform
 * - @/utils/digitalData (`setDigitalDataPageForPathname`)
 */

import { useEffect } from "react";
import { Platform } from "react-native";
import { usePathname } from "expo-router";
import { setDigitalDataPageForPathname } from "@/utils/digitalData";

// 1. 루트 `_layout` 에서 마운트한다.
export default function DigitalDataSync() {
  const pathname = usePathname();

  useEffect(() => {
    if (Platform.OS !== "web") {
      return;
    }
    setDigitalDataPageForPathname(pathname);
  }, [pathname]);

  return null;
}
