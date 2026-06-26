/**
 * components/login/telecomLinesApi.ts (통신사 회선 목록 조회 클라이언트)
 * ================================================================================
 * 백엔드 `GET /api/telecom/lines`(lgu_target_test.telecom_test_lines)를 호출해 로그인 모달의
 * 테이블에 뿌릴 회선 목록을 가져온다. line_id 가 로그인 시 Adobe Target 식별자(thirdPartyId)로 쓰인다.
 *
 * [Main Functions]
 * ===========
 * - fetchTelecomLines: 회선 목록 조회(실패 시 throw)
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - TelecomLine: 회선 1행 타입(백엔드 TelecomLineOut 과 대응)
 * - fetchTelecomLines(): Promise<TelecomLine[]>
 *
 * [Dependencies]
 * =========
 * - @/utils/loadConfig (api_base_url / api_url)
 */

import { config } from "@/utils/loadConfig";

/** 백엔드 TelecomLineOut 과 1:1 대응(파생값 contract_d_day·device_age_months 포함). */
export interface TelecomLine {
  line_id: string;
  customer_id: string;
  customer_name: string;
  customer_grade: string;
  bundle_yn: string;
  phone_no: string;
  plan_name: string;
  network_type: string;
  monthly_fee: number;
  contract_type: string;
  contract_end_date: string | null;
  device_model: string;
  device_purchase_date: string | null;
  data_usage_pct: number;
  age_group: string;
  join_date: string | null;
  churn_risk: string;
  marketing_consent_yn: string;
  contract_d_day: number | null;
  device_age_months: number | null;
}

interface TelecomLinesResponse {
  data: TelecomLine[];
  total_count: number;
}

const API_BASE_URL =
  config.api_base_url ?? config.api_url ?? "http://localhost:8010";

// 1. 회선 목록 조회 — 비정상 응답/네트워크 오류는 호출부에서 처리하도록 throw 한다.
export async function fetchTelecomLines(): Promise<TelecomLine[]> {
  const res = await fetch(`${API_BASE_URL}/api/telecom/lines`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`telecom_lines_http_${res.status}`);
  }
  const json = (await res.json()) as TelecomLinesResponse;
  return Array.isArray(json?.data) ? json.data : [];
}
