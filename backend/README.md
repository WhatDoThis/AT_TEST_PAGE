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

- `GET /api/coupons?page=1&page_size=10` — OFFSET 호환 모드.
- `GET /api/coupons?cursor_created=...&cursor_id=...&direction=next|prev&page_size=10` — keyset(커서) 모드.
- `GET /api/coupons?direction=last&page_size=10` — 맨뒤(가장 오래된 구간) 조회.
- `GET /api/coupons/csv` — 위와 동일 파라미터를 받아 현재 구간 CSV 다운로드.
- 응답 필드: `created`, `campaign_label`, `workflow_label`, `coupon_id`, `pagination.next_cursor`, `pagination.prev_cursor`.
- `total_count`는 `pg_class.reltuples` 기반 추정(미분석 시 TTL 캐시된 `COUNT(*)`).

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
