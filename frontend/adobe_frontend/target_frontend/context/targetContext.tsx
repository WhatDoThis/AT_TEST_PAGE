/**
 * adobe_frontend.target_frontend.context.targetContext (Adobe Target 오퍼 전역 컨텍스트)
 * ================================================================================
 * 루트 레이아웃이 받은 Adobe Target 오퍼를 트리 하위 화면에 Context로 내려준다.
 * 화면별 fetch 중복을 막고, 같은 세션 동안 동일 오퍼를 재사용한다.
 *
 * [Main Functions]
 * ===========
 * - AdobeTargetProvider: 캐러셀·이벤트 팝업 오퍼 상태 보관·`refreshOffers`
 * - useAdobeTargetOffer / useAdobeTargetSetOffer: 캐러셀 오퍼
 * - useAdobeTargetEventPopup / useAdobeTargetSetEventPopupOffer: event-popup 오퍼
 * - useAdobeTargetRefreshOffers: 클릭 후 offers 재조회
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - AdobeTargetContextValue: Context 상태/동작 형태
 *
 * [Dependencies]
 * =========
 * - react (Context, useState, useMemo, useCallback)
 * - ../utils/targetOffersFetch (`fetchAdobeTargetOffersResponse`)
 */

// ════════════════════════════════════════════════════════════════════════════════
// ████████  ADOBE TARGET 전용 파일 — 전체 코드가 Adobe Target 연동용  ████████
// ════════════════════════════════════════════════════════════════════════════════

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { fetchAdobeTargetOffersResponse } from "../utils/targetOffersFetch";
import {
  parseAdobeTargetOffersPayload,
  type AdobeTargetEventPopupOffer,
  type AdobeTargetOffer,
} from "../utils/targetOfferParser";

interface AdobeTargetContextValue {
  offer: AdobeTargetOffer | null;
  setOffer: (offer: AdobeTargetOffer | null) => void;
  eventPopupOffer: AdobeTargetEventPopupOffer | null;
  setEventPopupOffer: (offer: AdobeTargetEventPopupOffer | null) => void;
  refreshOffers: () => Promise<void>;
}

const AdobeTargetContext = createContext<AdobeTargetContextValue | null>(null);

async function _noopRefreshOffers(): Promise<void> {}

// 1. 루트 레이아웃에서 트리를 감쌀 Provider
export function AdobeTargetProvider({ children }: { children: ReactNode }) {
  const [offer, setOffer] = useState<AdobeTargetOffer | null>(null);
  const [eventPopupOffer, setEventPopupOffer] =
    useState<AdobeTargetEventPopupOffer | null>(null);

  const refreshOffers = useCallback(async () => {
    try {
      const { ok, status, data } = await fetchAdobeTargetOffersResponse();
      if (!ok) {
        console.warn("[AT] refreshOffers HTTP fail:", status);
        return;
      }
      // ── Adobe Target ── 클릭 후 offers-only 재조회
      console.log("[Adobe Target] refreshOffers triggered");
      const { carousel, eventPopup } = parseAdobeTargetOffersPayload(data);
      setOffer(carousel);
      setEventPopupOffer(eventPopup);
      console.log("[Adobe Target] refreshOffers loaded:", data);
      if (eventPopup !== null) {
        console.log("[Adobe Target] event-popup offer received", eventPopup);
      }
    } catch (err) {
      console.warn("[AT] refreshOffers fail:", err);
    }
  }, []);

  const value = useMemo<AdobeTargetContextValue>(
    () => ({
      offer,
      setOffer,
      eventPopupOffer,
      setEventPopupOffer,
      refreshOffers,
    }),
    [offer, eventPopupOffer, refreshOffers],
  );
  return (
    <AdobeTargetContext.Provider value={value}>
      {children}
    </AdobeTargetContext.Provider>
  );
}

// 2. 하위 컴포넌트가 캐러셀 오퍼만 읽고 싶을 때 사용
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

// 4. ── Adobe Target ── 이벤트 팝업 오퍼 저장(TargetOffersPreload 등)
export function useAdobeTargetSetEventPopupOffer(): (
  offer: AdobeTargetEventPopupOffer | null,
) => void {
  const ctx = useContext(AdobeTargetContext);
  return ctx?.setEventPopupOffer ?? (() => {});
}

// 5. ── Adobe Target ── 이벤트 팝업 오퍼 소비·닫기
export function useAdobeTargetEventPopup(): {
  offer: AdobeTargetEventPopupOffer | null;
  dismiss: () => void;
} {
  const ctx = useContext(AdobeTargetContext);
  const offer = ctx?.eventPopupOffer ?? null;
  const dismiss = useCallback(() => {
    // ── Adobe Target ──
    console.log("[Adobe Target] event-popup dismissed");
    ctx?.setEventPopupOffer(null);
  }, [ctx]);
  return { offer, dismiss };
}

// 6. ── Adobe Target ── 클릭 직후 등에서 offers 재조회
export function useAdobeTargetRefreshOffers(): () => Promise<void> {
  const ctx = useContext(AdobeTargetContext);
  return ctx?.refreshOffers ?? _noopRefreshOffers;
}

