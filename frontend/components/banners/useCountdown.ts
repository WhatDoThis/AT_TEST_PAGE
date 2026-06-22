/**
 * components/banners/useCountdown.ts (띠배너 카운트다운 공용 훅)
 * ================================================================================
 * 오퍼의 `endAt`(종료시각) 기준으로 남은 시간을 1초마다 계산해 주는 작은 공용 훅.
 * 상단/하단 띠배너(TopBanner/BottomBanner)가 공유하며, `endAt` 이 없으면 일반 띠배너처럼 동작한다.
 * (at.js 룰의 복잡한 렌더링 로직을 대체하는 유일한 신규 로직)
 *
 * 마케터 친화 입력: 타임존·T 구분자 없이 간단히 적어도 한국시간(KST, +09:00) 기준으로 해석한다.
 *   - "2026-06-22"          → 그날 23:59:59 (KST, 마감일 직관)
 *   - "2026-06-22 23:59"    → 그날 23:59:00 (KST)
 *   - "2026-06-22 18:00:00" → 그 시각 (KST)
 *   - "2026-06-22T23:59:59+09:00" 등 타임존 명시 풀 ISO 도 그대로 사용(하위호환)
 *
 * [Main Functions]
 * ===========
 * - useCountdown: endAt 기준 남은시간 → { label, active, expired }
 * - _normalizeEndAt: 마케터 친화 입력을 KST 기준 epoch(ms)로 정규화
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - useCountdown(endAt?): { label: string; active: boolean; expired: boolean }
 *
 * [Dependencies]
 * =========
 * - react (useEffect, useState)
 */

import { useEffect, useState } from "react";

/** 시간/타임존 생략 시 기준 타임존(한국 표준시). 통신사(국내) 캠페인 기본값. */
const DEFAULT_TZ = "+09:00";
/** "YYYY-MM-DD[ |T]HH:MM[:SS]?[Z|±HH:MM]?" 를 너그럽게 받는다. */
const END_AT_RE =
  /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?\s*(Z|[+-]\d{2}:?\d{2})?$/;

// 1. endAt(마케터 친화 입력 또는 ISO) 기준 남은 시간을 1초마다 계산한다.
//    - active: 진행 중 / expired: 만료 / label: "2일 03:12:45" 형태(없으면 "")
export function useCountdown(endAt?: string): {
  label: string;
  active: boolean;
  expired: boolean;
} {
  const endMs = endAt ? _normalizeEndAt(endAt) : NaN;
  const valid = !Number.isNaN(endMs);
  const [remainMs, setRemainMs] = useState<number>(
    valid ? endMs - Date.now() : -1,
  );

  useEffect(() => {
    if (!valid) {
      return;
    }
    setRemainMs(endMs - Date.now());
    const id = setInterval(() => setRemainMs(endMs - Date.now()), 1000);
    return () => clearInterval(id);
  }, [endMs, valid]);

  if (!valid) {
    return { label: "", active: false, expired: false };
  }
  if (remainMs <= 0) {
    return { label: "", active: false, expired: true };
  }
  return { label: _formatRemaining(remainMs), active: true, expired: false };
}

// 2. 마케터 친화 입력을 KST 기준 ISO 로 맞춰 epoch(ms)로 변환한다.
//    시간 생략 시 그날 23:59:59(마감일 직관), 타임존 생략 시 +09:00(KST) 으로 채운다.
//    인식 못 하는 형태는 표준 Date.parse 에 위임해 완전 커스텀 문자열도 호환한다.
function _normalizeEndAt(raw: string): number {
  const m = END_AT_RE.exec(raw.trim());
  if (!m) {
    return Date.parse(raw);
  }
  const [, y, mo, d, hh, mm, ss, tz] = m;
  const time = hh ? `${hh.padStart(2, "0")}:${mm}:${ss ?? "00"}` : "23:59:59";
  return Date.parse(`${y}-${mo}-${d}T${time}${tz ?? DEFAULT_TZ}`);
}

// 3. 남은 ms 를 "N일 HH:MM:SS"(일=0 이면 생략)로 변환한다.
function _formatRemaining(ms: number): string {
  const total = Math.floor(ms / 1000);
  const days = Math.floor(total / 86400);
  const pad = (n: number) => String(n).padStart(2, "0");
  const clock = `${pad(Math.floor((total % 86400) / 3600))}:${pad(
    Math.floor((total % 3600) / 60),
  )}:${pad(total % 60)}`;
  return days > 0 ? `${days}일 ${clock}` : clock;
}
