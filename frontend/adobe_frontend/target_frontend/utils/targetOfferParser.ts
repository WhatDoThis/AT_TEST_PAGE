/**
 * adobe_frontend.target_frontend.utils.targetOfferParser (Adobe Target 오퍼 파서)
 * ================================================================================
 * Target 프록시 응답의 `offers` 배열에서 캐러셀 오퍼와 이벤트 팝업 오퍼를 파싱한다.
 * (`POST /api/target/offers`·`POST /api/target/profile-test` 등 동일 shape 의 `offers` 에 적용)
 * Context/Preload/UI 컴포넌트가 같은 파싱 규칙을 재사용한다.
 *
 * [Main Functions]
 * ===========
 * - parseAdobeTargetOffersPayload: offers 배열을 캐러셀/팝업 오퍼로 분해
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - AdobeTargetOffer
 * - AdobeTargetEventPopupOffer
 * - parseAdobeTargetOffersPayload(data)
 *
 * [Dependencies]
 * =========
 * - 없음(순수 함수)
 */

export interface AdobeTargetOffer {
  buttonText?: string;
  autoPlayMs?: number;
}

// ── Adobe Target ── Form-Based JSON (`type: "event-popup"`)
export interface AdobeTargetEventPopupOffer {
  title?: string;
  body?: string;
  buttonText?: string;
}

// 1. 백엔드 Target 프록시 응답의 `offers` 배열에서 캐러셀·이벤트 팝업 오퍼를 함께 추출한다.
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
