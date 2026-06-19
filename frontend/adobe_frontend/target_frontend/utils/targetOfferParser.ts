/**
 * adobe_frontend.target_frontend.utils.targetOfferParser (Adobe Target 오퍼 파서)
 * ================================================================================
 * 서버 프록시 응답의 `offers` 배열에서 캐러셀·이벤트 팝업용 필드를 추출한다.
 * (`POST /api/target/offers`·`POST /api/target/profile-test` 등 동일 shape 의 `offers` 에 적용)
 *
 * [Main Functions]
 * ===========
 * - parseAdobeTargetOffersPayload: bootstrap/일반 응답에서 carousel·eventPopup·top/bottom 띠배너 추출
 * - parseAdobeTargetOfferItemContent: 단일 항목 content 객체화
 * - parseAdobeTargetEventPopupContent: 단일 오퍼 콘텐츠(문자열/객체)에서 event-popup 오퍼 추출(네이티브 SDK 공용)
 * - getAdobeTargetOfferRawEntryForLocation: mbox_name 또는 루트 `mbox` 와 일치하는 항목 탐색
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - AdobeTargetOffer, AdobeTargetEventPopupOffer, AdobeTargetBannerOffer
 * - parseAdobeTargetOffersPayload(data)
 * - parseAdobeTargetOfferItemContent(item)
 * - parseAdobeTargetEventPopupContent(content)
 * - getAdobeTargetOfferRawEntryForLocation(data, location)
 *
 * [Dependencies]
 * =========
 * - 없음(순수 함수)
 */

export interface AdobeTargetOffer {
  buttonText?: string;
  autoPlayMs?: number;
}

export interface AdobeTargetEventPopupOffer {
  title?: string;
  body?: string;
  buttonText?: string;
}

/** 상단/하단 띠배너(strip banner) 오퍼. 노출 위치(top/bottom)는 오퍼 type 으로 구분한다. */
export interface AdobeTargetBannerOffer {
  title?: string;
  body?: string;
  ctaText?: string;
  ctaUrl?: string;
  backgroundColor?: string;
  textColor?: string;
}

// 1. `offers` 배열에서 캐러셀·이벤트 팝업·상/하단 띠배너 오퍼를 추출한다.
export function parseAdobeTargetOffersPayload(data: unknown): {
  carousel: AdobeTargetOffer | null;
  eventPopup: AdobeTargetEventPopupOffer | null;
  topBanner: AdobeTargetBannerOffer | null;
  bottomBanner: AdobeTargetBannerOffer | null;
} {
  const empty = {
    carousel: null,
    eventPopup: null,
    topBanner: null,
    bottomBanner: null,
  };
  if (!data || typeof data !== "object") {
    return empty;
  }
  const offers = (data as { offers?: unknown }).offers;
  if (!Array.isArray(offers)) {
    return empty;
  }

  let carousel: AdobeTargetOffer | null = null;
  let eventPopup: AdobeTargetEventPopupOffer | null = null;
  let topBanner: AdobeTargetBannerOffer | null = null;
  let bottomBanner: AdobeTargetBannerOffer | null = null;

  for (const item of offers) {
    const candidate = _coerceOfferContent(item);
    if (!candidate) {
      continue;
    }

    const offerType = candidate.type;
    if (offerType === "event-popup") {
      if (eventPopup === null) {
        eventPopup = {
          title: _toOptionalTrimmedString(candidate.title),
          body: _toOptionalTrimmedString(candidate.body),
          buttonText: _toOptionalTrimmedString(candidate.buttonText),
        };
      }
      continue;
    }
    if (offerType === "top-banner") {
      if (topBanner === null) {
        topBanner = _toBannerOffer(candidate);
      }
      continue;
    }
    if (offerType === "bottom-banner") {
      if (bottomBanner === null) {
        bottomBanner = _toBannerOffer(candidate);
      }
      continue;
    }

    if (carousel !== null) {
      continue;
    }
    const buttonText = _toNonEmptyString(candidate.buttonText);
    const autoPlayMs = _toPositiveNumber(candidate.autoPlayMs);
    if (buttonText !== undefined || autoPlayMs !== undefined) {
      carousel = { buttonText, autoPlayMs };
    }
  }

  return { carousel, eventPopup, topBanner, bottomBanner };
}

// 2. 단일 offers[] 항목에서 JSON content 객체를 추출한다(문자열·이중 문자열 파싱 포함).
export function parseAdobeTargetOfferItemContent(
  item: unknown,
): Record<string, unknown> | null {
  return _coerceOfferContent(item);
}

// 2-1. 단일 오퍼 "콘텐츠"(문자열 또는 객체)에서 event-popup 오퍼를 추출한다.
//      웹은 `{ offers: [{ content }] }` 형태라 parseAdobeTargetOffersPayload 를 쓰지만,
//      네이티브 SDK(retrieveLocationContent)는 오퍼 콘텐츠 "값" 자체(JSON 문자열)를 그대로 돌려주므로
//      그 값을 바로 받아 동일한 EventPopup 오퍼로 변환할 때 사용한다. type 이 event-popup 이 아니면 null.
export function parseAdobeTargetEventPopupContent(
  content: unknown,
): AdobeTargetEventPopupOffer | null {
  const candidate = _coerceContentValue(content);
  if (!candidate || candidate.type !== "event-popup") {
    return null;
  }
  return {
    title: _toOptionalTrimmedString(candidate.title),
    body: _toOptionalTrimmedString(candidate.body),
    buttonText: _toOptionalTrimmedString(candidate.buttonText),
  };
}

// 3. `mbox_name` 이 `location` 과 같거나, 루트 `mbox` 가 `location` 과 같을 때 해당 항목을 고른다.
export function getAdobeTargetOfferRawEntryForLocation(
  data: unknown,
  location: string,
): unknown | null {
  const loc = location.trim();
  if (!loc) {
    return null;
  }
  if (!data || typeof data !== "object") {
    return null;
  }
  const root = data as { offers?: unknown; mbox?: unknown };
  const offers = root.offers;
  if (!Array.isArray(offers) || offers.length === 0) {
    return null;
  }

  for (const item of offers) {
    if (!item || typeof item !== "object") {
      continue;
    }
    const mboxName = (item as { mbox_name?: unknown }).mbox_name;
    if (typeof mboxName === "string" && mboxName.trim() === loc) {
      return item;
    }
  }

  const topMbox = root.mbox;
  if (typeof topMbox === "string" && topMbox.trim() === loc) {
    for (const item of offers) {
      if (!item || typeof item !== "object") {
        continue;
      }
      const mn = (item as { mbox_name?: unknown }).mbox_name;
      if (mn == null || mn === "") {
        return item;
      }
    }
    return offers[0] ?? null;
  }

  return null;
}

// offers[] 항목(`{ content }`)에서 content 값을 꺼내 객체화.
function _coerceOfferContent(item: unknown): Record<string, unknown> | null {
  if (!item || typeof item !== "object") {
    return null;
  }
  return _coerceContentValue((item as { content?: unknown }).content);
}

// 콘텐츠 "값"을 객체화한다(객체면 그대로, 문자열이면 JSON 파싱·이중 문자열까지 1단계 더 파싱).
// _coerceOfferContent(웹 offers 항목) 와 parseAdobeTargetEventPopupContent(네이티브 단일 콘텐츠) 의 공통 코어.
function _coerceContentValue(content: unknown): Record<string, unknown> | null {
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

// 띠배너 content 객체에서 표시·스타일 필드만 안전하게 추출한다.
function _toBannerOffer(
  candidate: Record<string, unknown>,
): AdobeTargetBannerOffer {
  return {
    title: _toOptionalTrimmedString(candidate.title),
    body: _toOptionalTrimmedString(candidate.body),
    ctaText: _toOptionalTrimmedString(candidate.ctaText),
    ctaUrl: _toOptionalTrimmedString(candidate.ctaUrl),
    backgroundColor: _toOptionalTrimmedString(candidate.backgroundColor),
    textColor: _toOptionalTrimmedString(candidate.textColor),
  };
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

function _toOptionalTrimmedString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
