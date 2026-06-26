/**
 * adobe_frontend.target_frontend.context.visitorContext (로그인 방문자 식별자 전역 컨텍스트)
 * ================================================================================
 * 테스트용 "로그인"을 관리한다. 회선(telecom_test_lines) 1건을 선택해 로그인하면 그 회선ID(line_id)를
 * Adobe Target 식별자(웹=thirdPartyId / 네이티브=Target.setThirdPartyId)로 주입하고 오퍼를 재조회한다.
 * 로그아웃하면 식별자를 초기화(웹=세션키 제거 / 네이티브=resetExperience)하고 익명으로 되돌린다.
 * 로그인 상태는 sessionStore 에 저장해 새로고침 후에도 헤더 표시가 유지된다.
 *
 * [Main Functions]
 * ===========
 * - VisitorProvider: 로그인 회선 상태 + login/logout (식별자 주입/해제 → refreshOffers)
 * - useVisitorLine: 현재 로그인된 회선(없으면 null)
 * - useVisitorLogin / useVisitorLogout: 로그인/로그아웃 액션
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - VisitorLine (로그인 식별 표시용 최소 정보)
 * - VisitorProvider
 *
 * [Dependencies]
 * =========
 * - react, react-native(Platform)
 * - ./targetContext (useAdobeTargetRefreshOffers)
 * - ../utils/targetSession (식별자 세션 키), ../utils/sessionStore (set/remove)
 * - @adobe-native/native/adobeMobileTarget (setTargetVisitor, resetTargetExperience — 웹 no-op)
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Platform } from "react-native";
import {
  resetTargetExperience,
  setTargetVisitor,
} from "@adobe-native/native/adobeMobileTarget";
import { useAdobeTargetRefreshOffers } from "./targetContext";
import {
  AT_LOCATION_HINT_KEY,
  AT_SESSION_ID_KEY,
  AT_TARGET_COOKIE_VALUE_KEY,
  AT_THIRD_PARTY_ID_STORAGE_KEY,
  AT_TNTID_STORAGE_KEY,
} from "../utils/targetSession";
import {
  sessionGetItem,
  sessionRemoveItem,
  sessionSetItem,
} from "../utils/sessionStore";

/** 헤더 표시·식별자 주입에 필요한 로그인 회선 최소 정보. */
export interface VisitorLine {
  lineId: string;
  customerName: string;
  planName?: string;
  customerGrade?: string;
}

interface VisitorContextValue {
  line: VisitorLine | null;
  login: (line: VisitorLine) => Promise<void>;
  logout: () => Promise<void>;
}

const VisitorContext = createContext<VisitorContextValue | null>(null);

/** 새로고침 후에도 로그인 회선 표시를 복원하기 위한 sessionStore 키. */
const VISITOR_LINE_KEY = "at_login_line";

// 1. [복원] 세션에 저장된 로그인 회선(JSON)을 읽어 초기 상태로 사용한다.
function _readStoredLine(): VisitorLine | null {
  const raw = sessionGetItem(VISITOR_LINE_KEY);
  if (!raw) {
    return null;
  }
  try {
    const obj = JSON.parse(raw) as VisitorLine;
    return obj && typeof obj.lineId === "string" ? obj : null;
  } catch {
    return null;
  }
}

// 2. [웹 식별자] tnt/쿠키/세션을 비워 이전 익명·타 회선과 섞이지 않게 한 뒤 thirdPartyId 를 회선ID로 고정한다.
function _applyWebLogin(lineId: string): void {
  sessionRemoveItem(AT_TNTID_STORAGE_KEY);
  sessionRemoveItem(AT_TARGET_COOKIE_VALUE_KEY);
  sessionRemoveItem(AT_LOCATION_HINT_KEY);
  sessionRemoveItem(AT_SESSION_ID_KEY);
  sessionSetItem(AT_THIRD_PARTY_ID_STORAGE_KEY, lineId);
}

// 3. [웹 식별자 해제] 로그인 관련 세션키를 모두 제거 → 다음 요청에서 새 익명 thirdPartyId 가 생성된다.
function _clearWebLogin(): void {
  sessionRemoveItem(AT_THIRD_PARTY_ID_STORAGE_KEY);
  sessionRemoveItem(AT_TNTID_STORAGE_KEY);
  sessionRemoveItem(AT_TARGET_COOKIE_VALUE_KEY);
  sessionRemoveItem(AT_LOCATION_HINT_KEY);
  sessionRemoveItem(AT_SESSION_ID_KEY);
}

// 4. [Provider] AdobeTargetProvider 안쪽에 두어 refreshOffers 를 사용한다.
export function VisitorProvider({ children }: { children: ReactNode }) {
  const refreshOffers = useAdobeTargetRefreshOffers();
  const [line, setLine] = useState<VisitorLine | null>(_readStoredLine);

  const login = useCallback(
    async (next: VisitorLine) => {
      const lineId = next.lineId.trim();
      if (!lineId) {
        return;
      }
      if (Platform.OS === "web") {
        _applyWebLogin(lineId);
      } else {
        // 네이티브: resetExperience 후 thirdPartyId(=회선ID) 설정(ECID 는 기기 고정).
        setTargetVisitor(lineId);
      }
      sessionSetItem(VISITOR_LINE_KEY, JSON.stringify(next));
      setLine(next);
      await refreshOffers();
    },
    [refreshOffers],
  );

  const logout = useCallback(async () => {
    if (Platform.OS === "web") {
      _clearWebLogin();
    } else {
      resetTargetExperience();
    }
    sessionRemoveItem(VISITOR_LINE_KEY);
    setLine(null);
    await refreshOffers();
  }, [refreshOffers]);

  const value = useMemo<VisitorContextValue>(
    () => ({ line, login, logout }),
    [line, login, logout],
  );
  return (
    <VisitorContext.Provider value={value}>{children}</VisitorContext.Provider>
  );
}

// 5. 현재 로그인된 회선(없으면 null)
export function useVisitorLine(): VisitorLine | null {
  return useContext(VisitorContext)?.line ?? null;
}

// 6. 로그인 액션(회선 선택 → 식별자 주입 → 오퍼 갱신)
export function useVisitorLogin(): (line: VisitorLine) => Promise<void> {
  const ctx = useContext(VisitorContext);
  return ctx?.login ?? (async () => {});
}

// 7. 로그아웃 액션(식별자 초기화 → 오퍼 갱신)
export function useVisitorLogout(): () => Promise<void> {
  const ctx = useContext(VisitorContext);
  return ctx?.logout ?? (async () => {});
}
