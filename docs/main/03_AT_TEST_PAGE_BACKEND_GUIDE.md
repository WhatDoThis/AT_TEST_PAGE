# AT_TEST_PAGE 백엔드/API 가이드 v1.0

본 문서는 `backend/` 기준의 현재 API/DB 연동 구조를 정리한 백엔드 상세 문서다.

- 제품 관점 요약: `docs/main/01_AT_TEST_PAGE_PRD.md`
- 프론트 상세: `docs/main/02_AT_TEST_PAGE_FRONTEND_GUIDE.md`

---

## 1. 백엔드 개요

### 1.1 기술 스택

| 항목 | 내용 |
|------|------|
| 프레임워크 | FastAPI |
| ASGI 서버 | uvicorn |
| ORM/쿼리 | SQLAlchemy Async |
| DB 드라이버 | asyncpg |
| DB | PostgreSQL |

### 1.2 역할

- 쿠폰 데이터 조회 API 제공
- 페이지/커서 기반 페이징 지원
- CSV 다운로드 API 제공

---

## 2. 디렉터리 구조

```text
backend/
├─ env/
│  ├─ config.dev.json
│  ├─ config.prd.json
│  └─ config.prd.example.json
├─ app/
│  ├─ main.py
│  ├─ config.py
│  ├─ database.py
│  ├─ schemas.py
│  └─ routers/
│     └─ coupons.py
├─ requirements.txt
└─ README.md
```

---

## 3. 실행 및 설정

### 3.1 설정 파일

`APP_ENV` 값으로 환경별 설정 파일을 읽는다.

- `APP_ENV=dev` -> `backend/env/config.dev.json`
- `APP_ENV=prd` -> `backend/env/config.prd.json`

주요 설정 키:

- `api_port`
- `cors_origins`
- `db.host`
- `db.port`
- `db.name`
- `db.user`
- `db.password`

운영 비밀값 관리를 위해 `backend/env/config.prd.example.json` 템플릿을 함께 제공한다.

### 3.2 실행 예시 (PowerShell)

```powershell
$env:APP_ENV = "dev"
uvicorn app.main:app --host 0.0.0.0 --port 8010 --reload
```

---

## 4. API 명세 요약

### 4.1 목록 조회

`GET /api/coupons`

지원 파라미터:

- `page` (기본 1)
- `page_size` (기본 10, 최대 100)
- `cursor_created`
- `cursor_id`
- `direction` (`next` | `prev` | `last`)

응답 주요 필드:

- `data[].created`
- `data[].campaign_label`
- `data[].workflow_label`
- `data[].coupon_id`
- `pagination.page`
- `pagination.total_count`
- `pagination.total_pages`
- `pagination.next_cursor`
- `pagination.prev_cursor`

### 4.2 CSV 다운로드

`GET /api/coupons/csv`

- 목록 조회와 동일 파라미터를 지원한다.
- 현재 조회 범위를 CSV 파일로 반환한다.
- UTF-8 BOM 포함으로 엑셀 한글 호환성을 보강한다.

---

## 5. 데이터 처리 방식

### 5.1 정렬 기준

- 기본 정렬: `created DESC, id DESC`

### 5.2 페이징 방식

- **OFFSET(page)**: 직접 페이지 점프 호환
- **KEYSET(cursor)**: 이전/다음 성능 최적화
- **last**: 가장 오래된 구간으로 이동할 때 사용

### 5.3 total_count 계산

- 우선 `pg_class.reltuples` 추정치를 사용
- 추정치가 유효하지 않으면 `COUNT(*)` 결과를 TTL 캐시로 재사용

---

## 6. 에러 처리 정책

- DB 연결/쿼리 오류 시 API는 `503 database_unavailable` 반환
- cursor 파라미터가 절반만 전달되면 `400` 반환
- CORS 허용 출처는 코드 하드코딩이 아니라 `cors_origins` 설정값으로 제어

---

## 7. 고객 안내 포인트

- 백엔드는 조회 중심으로 설계되어 데이터 변경 리스크가 낮다.
- 대량 데이터에서도 체감 속도를 확보하도록 커서 페이징을 병행한다.
- CSV 결과는 화면 기준 조회 범위와 일치하게 내려받을 수 있다.

---

## 8. 연관 문서

| 문서 | 용도 |
|------|------|
| `01_AT_TEST_PAGE_PRD.md` | 제품 요구사항 요약 |
| `02_AT_TEST_PAGE_FRONTEND_GUIDE.md` | 프론트엔드 상세 |
| `03_AT_TEST_PAGE_BACKEND_GUIDE.md` | 백엔드/API 상세 (본 문서) |
