/**
 * adobe_frontend.target_frontend.context.targetContext (Adobe Target 오퍼 전역 컨텍스트)
 * ================================================================================
 * 루트 레이아웃이 받은 Adobe Target 오퍼를 트리 하위 화면에 Context로 내려준다.
 * 화면별 fetch 중복을 막고, 같은 세션 동안 동일 오퍼를 재사용한다.
 *
 * [Main Functions]
 * ===========
 * - AdobeTargetProvider: offer 상태를 보관하고 Provider로 감싼다
 * - useAdobeTargetOffer: 하위 컴포넌트가 현재 오퍼만 읽음
 * - useAdobeTargetSetOffer: 루트 레이아웃에서 fetch 결과를 저장
 * - parseAdobeTargetOffer: `/api/target/offers` 응답에서 `{ buttonText, autoPlayMs }`를 추출
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - AdobeTargetOffer: 하위 컴포넌트가 소비하는 오퍼 형태
 *
 * [Dependencies]
 * =========
 * - react (Context, useState, useMemo)
 */

// ════════════════════════════════════════════════════════════════════════════════
// ████████  ADOBE TARGET 전용 파일 — 전체 코드가 Adobe Target 연동용  ████████
// ════════════════════════════════════════════════════════════════════════════════

import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface AdobeTargetOffer {
  buttonText?: string;
  autoPlayMs?: number;
}

interface AdobeTargetContextValue {
  offer: AdobeTargetOffer | null;
  setOffer: (offer: AdobeTargetOffer | null) => void;
}

const AdobeTargetContext = createContext<AdobeTargetContextValue | null>(null);

// 1. 루트 레이아웃에서 트리를 감쌀 Provider
export function AdobeTargetProvider({ children }: { children: ReactNode }) {
  const [offer, setOffer] = useState<AdobeTargetOffer | null>(null);
  const value = useMemo<AdobeTargetContextValue>(
    () => ({ offer, setOffer }),
    [offer],
  );
  return (
    <AdobeTargetContext.Provider value={value}>
      {children}
    </AdobeTargetContext.Provider>
  );
}

// 2. 하위 컴포넌트가 오퍼만 읽고 싶을 때 사용
export function useAdobeTargetOffer(): AdobeTargetOffer | null {
  const ctx = useContext(AdobeTargetContext);
  return ctx?.offer ?? null;
}

// 3. 루트 레이아웃에서 fetch 결과를 저장할 때 사용
export function useAdobeTargetSetOffer(): (
  offer: AdobeTargetOffer | null,
) => void {
  const ctx = useContext(AdobeTargetContext);
  return ctx?.setOffer ?? (() => {});
}

// 4. 백엔드 `/api/target/offers` 응답에서 첫 유효 오퍼를 정규화한다.
export function parseAdobeTargetOffer(data: unknown): AdobeTargetOffer | null {
  if (!data || typeof data !== "object") {
    return null;
  }
  const offers = (data as { offers?: unknown }).offers;
  if (!Array.isArray(offers)) {
    return null;
  }
  for (const item of offers) {
    const candidate = _coerceOfferContent(item);
    if (!candidate) {
      continue;
    }
    const buttonText = _toNonEmptyString(candidate.buttonText);
    const autoPlayMs = _toPositiveNumber(candidate.autoPlayMs);
    if (buttonText !== undefined || autoPlayMs !== undefined) {
      return { buttonText, autoPlayMs };
    }
  }
  return null;
}

function _coerceOfferContent(item: unknown): Record<string, unknown> | null {
  if (!item || typeof item !== "object") {
    return null;
  }
  const content = (item as { content?: unknown }).content;
  if (content && typeof content === "object") {
    return content as Record<string, unknown>;
  }
  if (typeof content !== "string") {
    return null;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    return null;
  }
  if (typeof parsed === "string") {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      return null;
    }
  }
  if (parsed && typeof parsed === "object") {
    return parsed as Record<string, unknown>;
  }
  return null;
}

function _toPositiveNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return value;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return undefined;
    }
    const n = Number(trimmed);
    if (Number.isFinite(n) && n > 0) {
      return n;
    }
  }
  return undefined;
}

function _toNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}
