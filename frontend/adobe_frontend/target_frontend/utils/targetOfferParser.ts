/**
 * adobe_frontend.target_frontend.utils.targetOfferParser (Adobe Target 오퍼 파서)
 * ================================================================================
 * 서버 프록시 응답의 `offers` 배열에서 캐러셀·이벤트 팝업용 필드를 추출한다.
 * (`POST /api/target/offers`·`POST /api/target/profile-test` 등 동일 shape 의 `offers` 에 적용)
 *
 * [Main Functions]
 * ===========
 * - parseAdobeTargetOffersPayload: bootstrap/일반 응답에서 carousel·eventPopup 추출
 * - parseAdobeTargetOfferItemContent: 단일 항목 content 객체화
 * - getAdobeTargetOfferRawEntryForLocation: mbox_name 또는 루트 `mbox` 와 일치하는 항목 탐색
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - AdobeTargetOffer, AdobeTargetEventPopupOffer
 * - parseAdobeTargetOffersPayload(data)
 * - parseAdobeTargetOfferItemContent(item)
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

// 1. `offers` 배열에서 캐러셀·이벤트 팝업 오퍼를 추출한다.
export function parseAdobeTargetOffersPayload(data: unknown): {
  carousel: AdobeTargetOffer | null;
  eventPopup: AdobeTargetEventPopupOffer | null;
} {
  if (!data || typeof data !== "object") {
    return { carousel: null, eventPopup: null };
  }
  const offers = (data as { offers?: unknown }).offers;
  if (!Array.isArray(offers)) {
    return { carousel: null, eventPopup: null };
  }

  let carousel: AdobeTargetOffer | null = null;
  let eventPopup: AdobeTargetEventPopupOffer | null = null;

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

    if (carousel !== null) {
      continue;
    }
    const buttonText = _toNonEmptyString(candidate.buttonText);
    const autoPlayMs = _toPositiveNumber(candidate.autoPlayMs);
    if (buttonText !== undefined || autoPlayMs !== undefined) {
      carousel = { buttonText, autoPlayMs };
    }
  }

  return { carousel, eventPopup };
}

// 2. 단일 offers[] 항목에서 JSON content 객체를 추출한다(문자열·이중 문자열 파싱 포함).
export function parseAdobeTargetOfferItemContent(
  item: unknown,
): Record<string, unknown> | null {
  return _coerceOfferContent(item);
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

function _toOptionalTrimmedString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
