/**
 * components/CouponTable.tsx (쿠폰 목록 카드·웹 전용)
 * ================================================================================
 * config.api_url 기반으로 GET /api/coupons를 호출하고, ImageGallery와 유사한 카드에 테이블·페이징·CSV(현재 페이지만)를 제공한다.
 *
 * [Main Functions]
 * ===========
 * - 웹(Platform.OS === "web")에서만 UI 렌더
 * - 이전/다음은 keyset(cursor), 맨앞/맨뒤는 점프 조회
 * - 페이지 직접 입력 점프는 Enter/blur 시 OFFSET(page) 요청
 * - ActivityIndicator·에러 재시도
 * - 현재 조회 범위를 서버 CSV 엔드포인트로 다운로드
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
  TextInput,
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

type CursorPoint = {
  created: string;
  id: number;
};

type Pagination = {
  page: number;
  page_size: number;
  total_count: number;
  total_pages: number;
  next_cursor?: CursorPoint | null;
  prev_cursor?: CursorPoint | null;
};

type ApiResponse = {
  data: CouponRow[];
  pagination: Pagination;
};

// 1. [데이터] api_url + 쿼리스트링으로 목록을 가져온다.
export default function CouponTable() {
  const { width } = useWindowDimensions();
  const cardOuterWidth = Math.min(width - 40, 540);

  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<CouponRow[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [nextCursor, setNextCursor] = useState<CursorPoint | null>(null);
  const [prevCursor, setPrevCursor] = useState<CursorPoint | null>(null);
  const [downloadQuery, setDownloadQuery] = useState<string>(
    `page=1&page_size=${PAGE_SIZE}`
  );
  const [pageInput, setPageInput] = useState("1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = (config.api_url || "").replace(/\/$/, "");

  const fetchByQuery = useCallback(async (query: string) => {
    if (!baseUrl) {
      setError("api_url이 비어 있습니다. env/config의 api_url을 설정하세요.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const url = `${baseUrl}/api/coupons?${query}`;
      const res = await fetch(url, { method: "GET" });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const body = (await res.json()) as ApiResponse;
      setRows(body.data ?? []);
      setPagination(body.pagination ?? null);
      setNextCursor(body.pagination?.next_cursor ?? null);
      setPrevCursor(body.pagination?.prev_cursor ?? null);
      setDownloadQuery(query);
      if (typeof body.pagination?.page === "number") {
        setPage(body.pagination.page);
        setPageInput(String(body.pagination.page));
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      setRows([]);
      setPagination(null);
      setNextCursor(null);
      setPrevCursor(null);
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  const fetchPage = useCallback(async (p: number) => {
    const query = `page=${p}&page_size=${PAGE_SIZE}`;
    await fetchByQuery(query);
  }, [fetchByQuery]);

  const fetchByCursor = useCallback(async (direction: "next" | "prev") => {
    const cursor = direction === "next" ? nextCursor : prevCursor;
    if (!cursor) {
      return;
    }
    const targetPage = direction === "next" ? page + 1 : Math.max(1, page - 1);
    const query =
      `page=${targetPage}&page_size=${PAGE_SIZE}` +
      `&direction=${direction}` +
      `&cursor_created=${encodeURIComponent(cursor.created)}` +
      `&cursor_id=${cursor.id}`;
    await fetchByQuery(query);
  }, [fetchByQuery, nextCursor, page, prevCursor]);

  const fetchLast = useCallback(async () => {
    const totalPages = pagination?.total_pages ?? 1;
    const query = `page=${totalPages}&page_size=${PAGE_SIZE}&direction=last`;
    await fetchByQuery(query);
  }, [fetchByQuery, pagination?.total_pages]);

  useEffect(() => {
    if (Platform.OS !== "web") {
      return;
    }
    void fetchPage(1);
  }, [fetchPage]);

  if (Platform.OS !== "web") {
    return null;
  }

  const totalPages = pagination?.total_pages ?? 0;
  const canFirst = page > 1 && !loading;
  const canPrev = prevCursor !== null && !loading;
  const canNext = nextCursor !== null && !loading;
  const canLast = totalPages > 0 && page < totalPages && !loading;

  const onDownloadCsv = () => {
    if (rows.length === 0) {
      return;
    }
    const url = `${baseUrl}/api/coupons/csv?${downloadQuery}`;
    if (typeof window !== "undefined") {
      window.open(url, "_blank");
    }
  };

  const commitPageInput = () => {
    const trimmed = pageInput.trim();
    const parsed = Number.parseInt(trimmed, 10);
    if (!Number.isInteger(parsed)) {
      setPageInput(String(page));
      return;
    }
    if (parsed < 1 || totalPages < 1 || parsed > totalPages) {
      setPageInput(String(page));
      return;
    }
    if (parsed === page) {
      setPageInput(String(page));
      return;
    }
    void fetchPage(parsed);
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
            onPress={() => void fetchByQuery(downloadQuery)}
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
              accessibilityLabel="맨 앞 페이지"
              onPress={() => void fetchPage(1)}
              disabled={!canFirst}
              style={({ pressed }) => [
                styles.pageBtn,
                !canFirst && styles.pageBtnDisabled,
                pressed && canFirst && styles.pageBtnPressed,
              ]}
            >
              <Text style={styles.pageBtnText}>맨앞</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="이전 페이지"
              onPress={() => void fetchByCursor("prev")}
              disabled={!canPrev}
              style={({ pressed }) => [
                styles.pageBtn,
                !canPrev && styles.pageBtnDisabled,
                pressed && canPrev && styles.pageBtnPressed,
              ]}
            >
              <Text style={styles.pageBtnText}>이전</Text>
            </Pressable>
            <View style={styles.pageInfoRow}>
              <TextInput
                value={pageInput}
                onChangeText={setPageInput}
                onSubmitEditing={commitPageInput}
                onBlur={commitPageInput}
                keyboardType="number-pad"
                style={styles.pageInput}
                textAlign="center"
                maxLength={8}
                editable={!loading}
                accessibilityLabel="페이지 직접 입력"
              />
              <Text style={styles.pageInfo}>
                / {totalPages > 0 ? totalPages : "—"}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="다음 페이지"
              onPress={() => void fetchByCursor("next")}
              disabled={!canNext}
              style={({ pressed }) => [
                styles.pageBtn,
                !canNext && styles.pageBtnDisabled,
                pressed && canNext && styles.pageBtnPressed,
              ]}
            >
              <Text style={styles.pageBtnText}>다음</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="맨 뒤 페이지"
              onPress={() => void fetchLast()}
              disabled={!canLast}
              style={({ pressed }) => [
                styles.pageBtn,
                !canLast && styles.pageBtnDisabled,
                pressed && canLast && styles.pageBtnPressed,
              ]}
            >
              <Text style={styles.pageBtnText}>맨뒤</Text>
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
  pageInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  pageInput: {
    width: 72,
    height: 34,
    borderWidth: 1,
    borderColor: "#cfd8e6",
    borderRadius: 8,
    backgroundColor: "#fff",
    color: "#333",
    fontSize: 14,
    fontWeight: "600",
    paddingHorizontal: 8,
    paddingVertical: 0,
  },
});
