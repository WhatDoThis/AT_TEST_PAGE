/**
 * components/CouponTable.tsx (쿠폰 목록 카드·웹 전용)
 * ================================================================================
 * config.api_url 기반으로 GET /api/coupons를 호출하고, ImageGallery와 유사한 카드에 테이블·페이징·CSV(현재 페이지만)를 제공한다.
 *
 * [Main Functions]
 * ===========
 * - 웹(Platform.OS === "web")에서만 UI 렌더
 * - 페이징 조회 및 ActivityIndicator·에러 재시도
 * - 현재 페이지 행만 CSV 다운로드(Blob 시점에 UTF-8 BOM 부착)
 *
 * [Endpoints/Classes/Functions]
 * =======================
 * - CouponTable: 무 props
 *
 * [Dependencies]
 * =========
 * - react-native
 * - @/utils/loadConfig
 */

import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { config } from "@/utils/loadConfig";

const PAGE_SIZE = 10;
const CARD_PADDING = 16;

type CouponRow = {
  created: string | null;
  campaign_label: string;
  workflow_label: string;
  coupon_id: string;
};

type Pagination = {
  page: number;
  page_size: number;
  total_count: number;
  total_pages: number;
};

type ApiResponse = {
  data: CouponRow[];
  pagination: Pagination;
};

// 1. [CSV] 현재 화면에 로드된 행만 이스케이프한다(BOM은 downloadCsvWeb에서 Blob에 붙임).
function buildCsv(rows: CouponRow[]): string {
  const header = ["created", "campaign_label", "workflow_label", "coupon_id"];
  const escape = (v: string) => {
    if (/[",\n\r]/.test(v)) {
      return `"${v.replace(/"/g, '""')}"`;
    }
    return v;
  };
  const lines = [header.join(",")];
  for (const row of rows) {
    const vals = [
      row.created ?? "",
      row.campaign_label ?? "",
      row.workflow_label ?? "",
      row.coupon_id ?? "",
    ].map((s) => escape(String(s)));
    lines.push(vals.join(","));
  }
  return lines.join("\n");
}

// 2. [웹 전용] UTF-8 BOM + Blob으로 엑셀 호환 다운로드를 트리거한다.
function downloadCsvWeb(filename: string, csvContent: string) {
  if (typeof document === "undefined") {
    return;
  }
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// 3. [데이터] api_url + 쿼리스트링으로 목록을 가져온다.
export default function CouponTable() {
  const { width } = useWindowDimensions();
  const cardOuterWidth = Math.min(width - 40, 540);

  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<CouponRow[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = (config.api_url || "").replace(/\/$/, "");

  const fetchPage = useCallback(async (p: number) => {
    if (!baseUrl) {
      setError("api_url이 비어 있습니다. env/config의 api_url을 설정하세요.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const url = `${baseUrl}/api/coupons?page=${p}&page_size=${PAGE_SIZE}`;
      const res = await fetch(url, { method: "GET" });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const body = (await res.json()) as ApiResponse;
      setRows(body.data ?? []);
      setPagination(body.pagination ?? null);
      const serverPage = body.pagination?.page;
      if (typeof serverPage === "number" && serverPage !== p) {
        setPage(serverPage);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      setRows([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  useEffect(() => {
    if (Platform.OS !== "web") {
      return;
    }
    void fetchPage(page);
  }, [page, fetchPage]);

  if (Platform.OS !== "web") {
    return null;
  }

  const totalPages = pagination?.total_pages ?? 0;
  const canPrev = page > 1 && !loading;
  const canNext = totalPages > 0 && page < totalPages && !loading;

  const onDownloadCsv = () => {
    if (rows.length === 0) {
      return;
    }
    const name = `coupons_page_${page}.csv`;
    downloadCsvWeb(name, buildCsv(rows));
  };

  return (
    <View style={[styles.card, { width: cardOuterWidth }]}>
      <View style={styles.headerRow}>
        <Text style={styles.cardTitle}>쿠폰 데이터 조회</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="현재 페이지 CSV 다운로드"
          onPress={onDownloadCsv}
          style={({ pressed }) => [
            styles.csvBtn,
            (rows.length === 0 || loading) && styles.csvBtnDisabled,
            pressed && styles.csvBtnPressed,
          ]}
          disabled={rows.length === 0 || loading}
        >
          <Text style={styles.csvBtnText}>CSV</Text>
        </Pressable>
      </View>

      {loading && (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color="#4A90D9" />
        </View>
      )}

      {error && !loading && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="다시 시도"
            onPress={() => void fetchPage(page)}
            style={({ pressed }) => [
              styles.retryBtn,
              pressed && styles.retryBtnPressed,
            ]}
          >
            <Text style={styles.retryBtnText}>재시도</Text>
          </Pressable>
        </View>
      )}

      {!loading && !error && (
        <>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, styles.colCreated]}>created</Text>
            <Text style={[styles.th, styles.colCamp]}>campaign</Text>
            <Text style={[styles.th, styles.colFlow]}>workflow</Text>
            <Text style={[styles.th, styles.colCoupon]}>coupon_id</Text>
          </View>
          {rows.map((row, idx) => (
            <View
              key={`${page}-${idx}`}
              style={[styles.tr, idx % 2 === 1 && styles.trAlt]}
            >
              <Text style={[styles.td, styles.colCreated]} numberOfLines={2}>
                {row.created ?? ""}
              </Text>
              <Text style={[styles.td, styles.colCamp]} numberOfLines={2}>
                {row.campaign_label}
              </Text>
              <Text style={[styles.td, styles.colFlow]} numberOfLines={2}>
                {row.workflow_label}
              </Text>
              <Text style={[styles.td, styles.colCoupon]} numberOfLines={2}>
                {row.coupon_id}
              </Text>
            </View>
          ))}
          <View style={styles.pager}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="이전 페이지"
              onPress={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!canPrev}
              style={({ pressed }) => [
                styles.pageBtn,
                !canPrev && styles.pageBtnDisabled,
                pressed && canPrev && styles.pageBtnPressed,
              ]}
            >
              <Text style={styles.pageBtnText}>이전</Text>
            </Pressable>
            <Text style={styles.pageInfo}>
              {totalPages > 0 ? `${page} / ${totalPages}` : `${page} / —`}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="다음 페이지"
              onPress={() => setPage((p) => p + 1)}
              disabled={!canNext}
              style={({ pressed }) => [
                styles.pageBtn,
                !canNext && styles.pageBtnDisabled,
                pressed && canNext && styles.pageBtnPressed,
              ]}
            >
              <Text style={styles.pageBtnText}>다음</Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: CARD_PADDING,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A2E",
    flexShrink: 1,
  },
  csvBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#4A90D9",
  },
  csvBtnPressed: {
    opacity: 0.85,
  },
  csvBtnDisabled: {
    backgroundColor: "#b8c9de",
  },
  csvBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  loadingBox: {
    paddingVertical: 16,
    alignItems: "center",
  },
  errorBox: {
    paddingVertical: 8,
    gap: 8,
  },
  errorText: {
    color: "#c0392b",
    fontSize: 13,
  },
  retryBtn: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#4A90D9",
  },
  retryBtnPressed: {
    opacity: 0.9,
  },
  retryBtnText: {
    color: "#fff",
    fontWeight: "600",
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e6e6e6",
    paddingBottom: 6,
    marginBottom: 4,
  },
  th: {
    fontSize: 11,
    fontWeight: "700",
    color: "#555",
  },
  tr: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  trAlt: {
    backgroundColor: "#fafbfc",
  },
  td: {
    fontSize: 11,
    color: "#333",
  },
  colCreated: { flex: 1.1, minWidth: 0, paddingRight: 4 },
  colCamp: { flex: 1, minWidth: 0, paddingRight: 4 },
  colFlow: { flex: 1, minWidth: 0, paddingRight: 4 },
  colCoupon: { flex: 0.9, minWidth: 0 },
  pager: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },
  pageBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#4A90D9",
  },
  pageBtnDisabled: {
    backgroundColor: "#cfd8e6",
  },
  pageBtnPressed: {
    opacity: 0.9,
  },
  pageBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  pageInfo: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
});
