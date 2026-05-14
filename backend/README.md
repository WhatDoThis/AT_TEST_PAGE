# AT_TEST_PAGE Backend (FastAPI)

Python 3.x + FastAPI + uvicorn + SQLAlchemy(async) + asyncpg. PostgreSQL의 기존 테이블 `test_coupons_data`를 조회만 한다.

## Configuration

- `.env` 미사용. 프로젝트 루트의 `env/config.{APP_ENV}.json`을 읽는다.
- `APP_ENV`: `dev` | `prd` (기본 `dev`).
- DB 필드: `db.host`, `db.port`, `db.name`, `db.user`, `db.password`.

## Run (development)

작업 디렉터리를 `backend/`로 맞춘 뒤 실행한다.

**Linux / macOS:**

```bash
export APP_ENV=dev
uvicorn app.main:app --host 0.0.0.0 --port 8010 --reload
```

**Windows (PowerShell):**

```powershell
$env:APP_ENV = "dev"
uvicorn app.main:app --host 0.0.0.0 --port 8010 --reload
```

## Run (production)

```bash
export APP_ENV=prd
uvicorn app.main:app --host 0.0.0.0 --port 8010
```

## API

- 목록·CSV는 DB 컬럼 `created`가 **2026-05-01 이상 2026-05-10 미만**인 행만 대상으로 하고, **`recipient_id`당 최신 1행**(같은 구간 내 `created`·`id` 내림차순)만 노출한다.
- `GET /api/coupons?page=1&page_size=10` — OFFSET 호환 모드(필터 구간 내).
- `GET /api/coupons?cursor_created=...&cursor_id=...&direction=next|prev&page_size=10` — keyset(커서) 모드.
- `GET /api/coupons?direction=last&page_size=10` — 맨뒤(필터 구간에서 가장 오래된 구간) 조회.
- `GET /api/coupons/csv?scope=page&...` — 목록과 동일 파라미터로 **현재 조회 구간** CSV.
- `GET /api/coupons/csv?scope=all` — 필터 구간 **전체 행** CSV.
- 응답 필드: `created`, `recipient_id`, `campaign_label`, `workflow_label`, `pagination.next_cursor`, `pagination.prev_cursor`.
- `total_count`는 위 구간에서의 **`COUNT(DISTINCT recipient_id)`**(TTL 캐시).

## Index Note

- 현재는 `created` 인덱스를 우선 활용한다.
- 동률 정렬 안정성을 위해 쿼리는 `ORDER BY created DESC, id DESC`를 사용한다.
- 매우 큰 데이터셋에서 keyset 응답이 느리면 `CREATE INDEX ... (created DESC, id DESC)` 복합 인덱스를 검토한다.

## nginx

`/at-test-api/` → `127.0.0.1:8010` 프록시 시, 일반적으로 `proxy_pass`에서 prefix를 제거해 백엔드에는 `/api/...` 경로로 전달한다.

## Install

```bash
python3 -m venv venv
./venv/bin/pip install -r requirements.txt
```

Windows에서는 `venv\Scripts\pip install -r requirements.txt`.
