/**
 * adobe_frontend.target_frontend.context.targetContext (Adobe Target 오퍼 전역 컨텍스트)
 * ================================================================================
 * 서버 SDK 프록시(`POST /api/target/offers`)로 받은 오퍼를 수동으로 Context에 반영한다.
 * 초기 값은 웹 `TargetPageBootstrap`(bootstrap mbox)이 채우고, `refreshOffers`는 동일 bootstrap mbox 로 재조회한다.
 *
 * [Main Functions]
 * ===========
 * - AdobeTargetProvider: 캐러셀·이벤트 팝업 오퍼·`refreshOffers`
 * - useAdobeTargetOffer / useAdobeTargetSetOffer
 * - useAdobeTargetEventPopup / useAdobeTargetSetEventPopupOffer
 * - useAdobeTargetRefreshOffers
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - AdobeTargetContextValue
 *
 * [Dependencies]
 * =========
 * - react
 * - ../utils/targetOffersFetch (`fetchAdobeTargetOffersResponseDeduped`, `getAdobeBootstrapMboxNameForFetch`)
 * - ../utils/targetOfferParser (`parseAdobeTargetOffersPayload`)
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
import {
  fetchAdobeTargetOffersResponseDeduped,
  getAdobeBootstrapMboxNameForFetch,
} from "../utils/targetOffersFetch";
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

// 1. 루트에서 트리를 감쌀 Provider
export function AdobeTargetProvider({ children }: { children: ReactNode }) {
  const [offer, setOffer] = useState<AdobeTargetOffer | null>(null);
  const [eventPopupOffer, setEventPopupOffer] =
    useState<AdobeTargetEventPopupOffer | null>(null);

  const refreshOffers = useCallback(async () => {
    const bootstrapMbox = getAdobeBootstrapMboxNameForFetch();
    try {
      const { ok, status, data } = await fetchAdobeTargetOffersResponseDeduped({
        mboxName: bootstrapMbox,
        force: true,
      });
      if (!ok) {
        console.warn("[AT] refreshOffers HTTP fail:", status);
        return;
      }
      const { carousel, eventPopup } = parseAdobeTargetOffersPayload(data);
      setOffer(carousel);
      setEventPopupOffer(eventPopup);
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

// 2. 캐러셀 오퍼 읽기
export function useAdobeTargetOffer(): AdobeTargetOffer | null {
  const ctx = useContext(AdobeTargetContext);
  return ctx?.offer ?? null;
}

// 3. 캐러셀 오퍼 저장
export function useAdobeTargetSetOffer(): (
  offer: AdobeTargetOffer | null,
) => void {
  const ctx = useContext(AdobeTargetContext);
  return ctx?.setOffer ?? (() => {});
}

// 4. 이벤트 팝업 오퍼 저장
export function useAdobeTargetSetEventPopupOffer(): (
  offer: AdobeTargetEventPopupOffer | null,
) => void {
  const ctx = useContext(AdobeTargetContext);
  return ctx?.setEventPopupOffer ?? (() => {});
}

// 5. 이벤트 팝업 오퍼 소비·닫기
export function useAdobeTargetEventPopup(): {
  offer: AdobeTargetEventPopupOffer | null;
  dismiss: () => void;
} {
  const ctx = useContext(AdobeTargetContext);
  const offer = ctx?.eventPopupOffer ?? null;
  const dismiss = useCallback(() => {
    ctx?.setEventPopupOffer(null);
  }, [ctx]);
  return { offer, dismiss };
}

// 6. bootstrap mbox 기준 offers 재조회
export function useAdobeTargetRefreshOffers(): () => Promise<void> {
  const ctx = useContext(AdobeTargetContext);
  return ctx?.refreshOffers ?? _noopRefreshOffers;
}
