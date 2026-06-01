/**
 * adobe_frontend.target_frontend.utils.sessionStore (웹/네이티브 범용 세션 저장소)
 * ================================================================================
 * Adobe Target 세션 값(tntId·thirdPartyId·쿠키·location hint·session_id·recipient_id)을
 * 웹·네이티브 어디서든 동일한 동기 API로 읽고 쓰게 한다.
 * - 웹: `sessionStorage`에 위임(기존 동작·세션 스코프 그대로 유지).
 * - 네이티브: 동기 접근용 메모리 캐시 + `AsyncStorage` write-through(앱 재시작에도 유지).
 *   AsyncStorage 미설치 시 메모리 전용으로 폴백한다.
 * 네이티브는 동기 읽기를 위해 앱 시작 시 `hydrateSessionStore()`로 메모리 캐시를 1회 적재한다.
 *
 * [Main Functions]
 * ===========
 * - sessionGetItem: 키 값 동기 조회(웹 sessionStorage / 네이티브 메모리)
 * - sessionSetItem: 키 값 저장(네이티브는 메모리 즉시 + AsyncStorage 비동기 반영)
 * - sessionRemoveItem: 키 값 삭제
 * - hydrateSessionStore: (네이티브) AsyncStorage → 메모리 캐시 1회 적재
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - sessionGetItem(key): string | null
 * - sessionSetItem(key, value): void
 * - sessionRemoveItem(key): void
 * - hydrateSessionStore(): Promise<void>
 *
 * [Dependencies]
 * =========
 * - react-native Platform
 * - @react-native-async-storage/async-storage (네이티브 전용·동적 로드)
 */

import { Platform } from "react-native";

/** 네이티브 AsyncStorage 중 본 모듈이 사용하는 메서드만 추린 타입. */
type AsyncStorageLike = {
  getAllKeys: () => Promise<readonly string[]>;
  multiGet: (keys: readonly string[]) => Promise<readonly [string, string | null][]>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

// 네이티브 AsyncStorage 키 충돌 방지용 접두사
const NATIVE_KEY_PREFIX = "@at_session/";
const IS_WEB = Platform.OS === "web";

// 네이티브 동기 접근용 캐시(AsyncStorage write-through·시작 시 hydrate)
const memoryCache = new Map<string, string>();

let nativeStorage: AsyncStorageLike | null = null;
if (!IS_WEB) {
  try {
    // 웹 번들은 이 분기를 실행하지 않으므로 sessionStorage 경로만 탄다.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    nativeStorage = (require("@react-native-async-storage/async-storage") as {
      default: AsyncStorageLike;
    }).default;
  } catch {
    nativeStorage = null; // 미설치 시 메모리 전용 폴백
  }
}

function _webStorage(): Storage | null {
  if (typeof sessionStorage === "undefined") {
    return null;
  }
  return sessionStorage;
}

// 1. 값 읽기 — 웹은 sessionStorage, 네이티브는 메모리 캐시(동기)
export function sessionGetItem(key: string): string | null {
  if (IS_WEB) {
    return _webStorage()?.getItem(key) ?? null;
  }
  return memoryCache.has(key) ? (memoryCache.get(key) as string) : null;
}

// 2. 값 쓰기 — 네이티브는 메모리 즉시 반영 후 AsyncStorage 비동기 반영
export function sessionSetItem(key: string, value: string): void {
  if (IS_WEB) {
    _webStorage()?.setItem(key, value);
    return;
  }
  memoryCache.set(key, value);
  nativeStorage?.setItem(NATIVE_KEY_PREFIX + key, value).catch(() => {});
}

// 3. 값 삭제 — 웹/네이티브 동일 키 기준
export function sessionRemoveItem(key: string): void {
  if (IS_WEB) {
    _webStorage()?.removeItem(key);
    return;
  }
  memoryCache.delete(key);
  nativeStorage?.removeItem(NATIVE_KEY_PREFIX + key).catch(() => {});
}

// 4. (네이티브) 앱 시작 시 AsyncStorage → 메모리 캐시 적재. 웹·미설치 시 no-op.
export async function hydrateSessionStore(): Promise<void> {
  if (IS_WEB || !nativeStorage) {
    return;
  }
  try {
    const allKeys = await nativeStorage.getAllKeys();
    const ours = allKeys.filter((k) => k.startsWith(NATIVE_KEY_PREFIX));
    if (ours.length === 0) {
      return;
    }
    const pairs = await nativeStorage.multiGet(ours);
    for (const [storedKey, value] of pairs) {
      if (typeof value === "string") {
        memoryCache.set(storedKey.slice(NATIVE_KEY_PREFIX.length), value);
      }
    }
  } catch {
    // 적재 실패는 무시하고 빈 메모리 캐시로 동작한다(세션 연속성만 일부 손실).
  }
}
