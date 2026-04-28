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

- `GET /api/coupons?page=1&page_size=10` — `created`, `campaign_label`, `workflow_label`, `coupon_id`만 반환. `total_count`는 `pg_class.reltuples` 기반 추정(미분석 시 TTL 캐시된 `COUNT(*)`).

## nginx

`/at-test-api/` → `127.0.0.1:8010` 프록시 시, 일반적으로 `proxy_pass`에서 prefix를 제거해 백엔드에는 `/api/...` 경로로 전달한다.

## Install

```bash
python3 -m venv venv
./venv/bin/pip install -r requirements.txt
```

Windows에서는 `venv\Scripts\pip install -r requirements.txt`.
