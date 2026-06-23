/**
 * adobe_frontend.target_frontend.context.targetContext (Adobe Target 오퍼 전역 컨텍스트)
 * ================================================================================
 * 서버 SDK 프록시(`POST /api/target/offers`)로 받은 오퍼를 수동으로 Context에 반영한다.
 * 초기 값은 웹 `TargetPageBootstrap`(bootstrap mbox)이 채우고, `refreshOffers`는 동일 bootstrap mbox 로 재조회한다.
 *
 * [Main Functions]
 * ===========
 * - AdobeTargetProvider: 캐러셀·이벤트 팝업·상/하단 띠배너 오퍼·`refreshOffers`
 * - useAdobeTargetOffer / useAdobeTargetSetOffer
 * - useAdobeTargetEventPopup / useAdobeTargetSetEventPopupOffer
 * - useAdobeTargetTopBanner / useAdobeTargetSetTopBanner
 * - useAdobeTargetBottomBanner / useAdobeTargetSetBottomBanner
 * - useAdobeTargetBannersReady / useAdobeTargetSetBannersReady (FOUC 방지: 부트스트랩 완료 전 배너 미렌더)
 * - useAdobeTargetRefreshOffers
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - AdobeTargetContextValue
 *
 * [Dependencies]
 * =========
 * - react
 * - ../utils/targetOffersFetch (`fetchAdobeTargetOffersResponseDeduped`)
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
import { fetchAdobeTargetOffersResponseDeduped } from "../utils/targetOffersFetch";
import {
  parseAdobeTargetOffersPayload,
  type AdobeTargetBannerOffer,
  type AdobeTargetEventPopupOffer,
  type AdobeTargetOffer,
} from "../utils/targetOfferParser";

interface AdobeTargetContextValue {
  offer: AdobeTargetOffer | null;
  setOffer: (offer: AdobeTargetOffer | null) => void;
  eventPopupOffer: AdobeTargetEventPopupOffer | null;
  setEventPopupOffer: (offer: AdobeTargetEventPopupOffer | null) => void;
  topBannerOffer: AdobeTargetBannerOffer | null;
  setTopBannerOffer: (offer: AdobeTargetBannerOffer | null) => void;
  bottomBannerOffer: AdobeTargetBannerOffer | null;
  setBottomBannerOffer: (offer: AdobeTargetBannerOffer | null) => void;
  // 띠배너 부트스트랩 완료 여부. 완료 전엔 배너를 렌더하지 않아 기본문구→오퍼 깜빡임(FOUC)을 막는다.
  bannersReady: boolean;
  setBannersReady: (ready: boolean) => void;
  refreshOffers: () => Promise<void>;
}

const AdobeTargetContext = createContext<AdobeTargetContextValue | null>(null);

async function _noopRefreshOffers(): Promise<void> {}

// 1. 루트에서 트리를 감쌀 Provider
export function AdobeTargetProvider({ children }: { children: ReactNode }) {
  const [offer, setOffer] = useState<AdobeTargetOffer | null>(null);
  const [eventPopupOffer, setEventPopupOffer] =
    useState<AdobeTargetEventPopupOffer | null>(null);
  const [topBannerOffer, setTopBannerOffer] =
    useState<AdobeTargetBannerOffer | null>(null);
  const [bottomBannerOffer, setBottomBannerOffer] =
    useState<AdobeTargetBannerOffer | null>(null);
  const [bannersReady, setBannersReady] = useState(false);

  const refreshOffers = useCallback(async () => {
    try {
      const { ok, status, data } = await fetchAdobeTargetOffersResponseDeduped({
        bootstrap: true,
        force: true,
      });
      if (!ok) {
        console.warn("[AT] refreshOffers HTTP fail:", status);
        return;
      }
      const { carousel, eventPopup, topBanner, bottomBanner } =
        parseAdobeTargetOffersPayload(data);
      setOffer(carousel);
      setEventPopupOffer(eventPopup);
      setTopBannerOffer(topBanner);
      setBottomBannerOffer(bottomBanner);
    } catch (err) {
      console.warn("[AT] refreshOffers fail:", err);
    } finally {
      setBannersReady(true);
    }
  }, []);

  const value = useMemo<AdobeTargetContextValue>(
    () => ({
      offer,
      setOffer,
      eventPopupOffer,
      setEventPopupOffer,
      topBannerOffer,
      setTopBannerOffer,
      bottomBannerOffer,
      setBottomBannerOffer,
      bannersReady,
      setBannersReady,
      refreshOffers,
    }),
    [
      offer,
      eventPopupOffer,
      topBannerOffer,
      bottomBannerOffer,
      bannersReady,
      refreshOffers,
    ],
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

// 6. 상단 띠배너 오퍼 읽기
export function useAdobeTargetTopBanner(): AdobeTargetBannerOffer | null {
  const ctx = useContext(AdobeTargetContext);
  return ctx?.topBannerOffer ?? null;
}

// 7. 상단 띠배너 오퍼 저장
export function useAdobeTargetSetTopBanner(): (
  offer: AdobeTargetBannerOffer | null,
) => void {
  const ctx = useContext(AdobeTargetContext);
  return ctx?.setTopBannerOffer ?? (() => {});
}

// 8. 하단 띠배너 오퍼 읽기
export function useAdobeTargetBottomBanner(): AdobeTargetBannerOffer | null {
  const ctx = useContext(AdobeTargetContext);
  return ctx?.bottomBannerOffer ?? null;
}

// 9. 하단 띠배너 오퍼 저장
export function useAdobeTargetSetBottomBanner(): (
  offer: AdobeTargetBannerOffer | null,
) => void {
  const ctx = useContext(AdobeTargetContext);
  return ctx?.setBottomBannerOffer ?? (() => {});
}

// 10. bootstrap mbox 기준 offers 재조회
export function useAdobeTargetRefreshOffers(): () => Promise<void> {
  const ctx = useContext(AdobeTargetContext);
  return ctx?.refreshOffers ?? _noopRefreshOffers;
}

// 11. 띠배너 부트스트랩 완료 여부 읽기(Provider 밖이면 true 로 간주해 숨김 방지)
export function useAdobeTargetBannersReady(): boolean {
  const ctx = useContext(AdobeTargetContext);
  return ctx?.bannersReady ?? true;
}

// 12. 띠배너 부트스트랩 완료 표시(웹 bootstrap·네이티브 즉시 호출)
export function useAdobeTargetSetBannersReady(): (ready: boolean) => void {
  const ctx = useContext(AdobeTargetContext);
  return ctx?.setBannersReady ?? (() => {});
}
