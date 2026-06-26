# AT_TEST_PAGE

Expo(React Native + Expo Router) **웹·Android** 단일 코드베이스와 **FastAPI** 백엔드(쿠폰 API + Adobe Target Delivery 프록시)를 한 저장소에서 관리한다. 상세 스펙·구조는 **`docs/main/`** 문서를 기준으로 한다.

## 개발 문서 (`docs/main`)

| 문서 | 내용 |
|------|------|
| [`01_AT_TEST_PAGE_PRD.md`](./docs/main/01_AT_TEST_PAGE_PRD.md) | 제품 범위·수용 기준 |
| [`02_AT_TEST_PAGE_FRONTEND_GUIDE.md`](./docs/main/02_AT_TEST_PAGE_FRONTEND_GUIDE.md) | 라우트·컴포넌트·`@adobe/*` 브리지 |
| [`03_AT_TEST_PAGE_BACKEND_GUIDE.md`](./docs/main/03_AT_TEST_PAGE_BACKEND_GUIDE.md) | API·DB·실행·CORS |
| [`04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md`](./docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md) | **Adobe Target 단일 참고**(엔드포인트·`VisitorId`/`tntId`·설정·디버그) |

## 저장소 구조 (요약)

| 경로 | 설명 |
|------|------|
| `frontend/` | Expo 앱 (`app/`, `components/`, `adobe_frontend/target_frontend/`, `package.json`) |
| `frontend/env/` | `config.{dev,prd}.example.json` → 로컬 JSON (**Git 제외**), `loadConfig.ts`가 `__DEV__`로 선택 |
| `backend/` | FastAPI (`app/`), `adobe_backend/target_backend/` — Target `POST /api/target/*` |
| `backend/env/` | `config.{dev,prd}.json`(`APP_ENV`, **`telecom_db`**), `config.adobe.json`(Git 제외) |
| `backend/requirements.txt` | 백엔드 Python 패키지 |
| `docs/` | `docs/main/` 가이드, `docs/adobe/`, `docs/files/`, `docs/log/` |
| `deploy.sh` | 리눅스에서 웹 정적 산출물 서빙용 스크립트 |
| [REQUIREMENTS.md](./REQUIREMENTS.md) | Node·Python 버전 등 공통 요구 사항 |

## 요구 사항

[REQUIREMENTS.md](./REQUIREMENTS.md)를 본다. 백엔드 패키지 목록은 **`backend/requirements.txt`** 이다.

## 프론트엔드 (로컬)

저장소 **루트**에서:

```bash
npm install
npm install --prefix frontend
npm run web
```

- **설정 분기**: `frontend/env/config.{dev,prd}.example.json`을 복사해 실제 JSON 작성 후 `loadConfig.ts`가 `__DEV__`로 선택.
- **라우트**: `/main`, `/profile-test`, `/recommendation-test`, `/scroll-test`, 네이티브 `/xttest`·`/abtest`·`/recommendation` — [`02`](./docs/main/02_AT_TEST_PAGE_FRONTEND_GUIDE.md) 참고.
- **회선 로그인**: 헤더 로그인 → `GET /api/telecom/lines` → `line_id`를 Target `thirdPartyId`로 주입.
- **웹 프로덕션 번들**: `npm run export:web` → 산출물 `frontend/dist/` ([`02` 가이드](./docs/main/02_AT_TEST_PAGE_FRONTEND_GUIDE.md)와 동일).

## 백엔드 (로컬)

`backend/` 디렉터리에서 가상환경을 두고 실행한다(경로·버전은 [REQUIREMENTS.md](./REQUIREMENTS.md)).

**Windows (PowerShell)**

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -U pip
python -m pip install -r requirements.txt
$env:APP_ENV = "dev"
uvicorn app.main:app --host 0.0.0.0 --port 8010 --reload
```

- **`APP_ENV`**: `dev` / `prd` → `backend/env/config.{dev,prd}.json` ([`03`](./docs/main/03_AT_TEST_PAGE_BACKEND_GUIDE.md)).
- **`telecom_db`**: 회선 테스트 DB(`lgu_target_test`) — example의 `telecom_db` 블록 참고.
- **`cors_origins`**: Expo 웹 출처(예: `http://localhost:8081`) 포함.

## Adobe Target

- **통합 설명**: [`04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md`](./docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md).
- **자격·mbox**: `backend/env/config.adobe.json` — 저장소에 올리지 않는다. `backend/env/config.adobe.example.json`을 복사해 채운다.
- **프록시 엔드포인트**(요약): `POST /api/target/offers`, `profile-test`, `recommendation-test` — 04 §6·§7.
- **회선 API**: `GET /api/telecom/lines`, `/lines/{line_id}` — 03 §4.
- **Delivery 진단 로그**: 환경변수 `AT_DEBUG_DELIVERY=1`(또는 `true`/`yes`/`on`)일 때만 `target_debug_utils.py`가 요청/응답 상세를 `WARNING`으로 남긴다. 기본값은 로그 없음.

## 리눅스 배포 (웹 정적)

1. 서버에 Node·npm, 전역 `pm2`, `serve` 설치: [REQUIREMENTS.md](./REQUIREMENTS.md).
2. 저장소를 서버 경로에 클론한 뒤 `deploy.sh`의 `APP_DIR` 등을 확인하고 실행:

```bash
chmod +x deploy.sh
./deploy.sh
```

경로·포트 덮어쓰기 예:

```bash
export APP_DIR=/opt/at_test_page
export PORT=3010
./deploy.sh
```

## 원격 저장소

https://github.com/WhatDoThis/AT_TEST_PAGE
