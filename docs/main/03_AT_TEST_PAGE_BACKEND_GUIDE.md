# AT_TEST_PAGE 백엔드/API 가이드

본 문서는 `backend/` 기준 **현재 API·DB·Adobe Target 프록시**를 한 곳에서 설명한다.

- Adobe Target **라우터 위치·`config.adobe.json`·세 API** 상세는 `docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md` 를 본다.

---

## 1. 개요

### 1.1 기술 스택

| 항목 | 내용 |
|------|------|
| 프레임워크 | FastAPI |
| 실행 | uvicorn |
| ORM | SQLAlchemy Async + asyncpg |
| DB | PostgreSQL |

### 1.2 역할

- 쿠폰 목록·CSV API.
- Adobe Target Delivery 호출을 위한 **`POST /api/target/*`** 프록시 3종(동기 SDK는 `asyncio.to_thread`).

---

## 2. 디렉터리 구조 (요약)

```text
backend/
├─ env/
│  ├─ config.dev.json / config.prd.json   # APP_ENV로 선택 — api_port, cors_origins, db.*
│  ├─ config.adobe.json                     # Target 자격(Git 제외) — target_config 전용
│  └─ config.adobe.example.json
├─ app/
│  ├─ main.py              # CORS, coupons 라우터, register_target_routes(app)
│  ├─ config.py
│  ├─ database.py
│  ├─ schemas.py
│  └─ routers/coupons.py
├─ adobe_backend/target_backend/
│  ├─ target_main.py       # register_target_routes — router prefix `/api`
│  ├─ target_adobe_router.py   # offers, profile-test, recommendation-test
│  ├─ target_client.py, target_config.py, target_delivery_utils.py, target_debug_utils.py
│  └─ …
└─ requirements.txt
```

---

## 3. 실행·설정

### 3.1 앱 설정 (`APP_ENV`)

- `APP_ENV=dev` → `backend/env/config.dev.json`
- `APP_ENV=prd` → `backend/env/config.prd.json`

주요 키: `api_port`, `cors_origins`, `db.host`·`db.port`·`db.name`·`db.user`·`db.password`. 운영 비밀은 `config.prd.example.json` 템플릿을 복사해 채운다.

### 3.2 Adobe 설정 (`config.adobe.json`)

- `APP_ENV`와 **무관하게** `target_config.get_adobe_target_settings()`가 이 파일만 읽는다.
- 키: `client`, `organization_id`, `property_token`, `timeout`, `mboxes.offer_mbox_name`, **`mboxes.recs_mbox_name`**(추천 전용; 생략 시 기본 `target-recs-mbox`) 등. 자격 필드 값은 ASCII 검증.

### 3.3 실행 예시 (PowerShell)

```powershell
$env:APP_ENV = "dev"
uvicorn app.main:app --host 0.0.0.0 --port 8010 --reload
```

### 3.4 CORS

`cors_origins`에 Expo 웹 출처(예: `http://localhost:8081`)를 넣는다. `allow_methods`에 **`POST`**가 포함되어야 Target 프록시가 동작한다.

---

## 4. 쿠폰 API

### 4.1 목록

`GET /api/coupons`

- 파라미터: `page`, `page_size`, `cursor_created`, `cursor_id`, `direction`(`next`|`prev`|`last`).
- 응답: `data[]`, `pagination`(page, total_count, total_pages, next_cursor, prev_cursor 등).

### 4.2 CSV

`GET /api/coupons/csv`

- 목록과 동일 필터. UTF-8 BOM 포함.

### 4.3 정렬·페이징·total_count

- 정렬: `created DESC, id DESC`.
- OFFSET + KEYSET + `last` 지원.
- total_count: `pg_class.reltuples` 우선, 불가 시 `COUNT(*)` TTL 캐시.

---

## 5. Adobe Target HTTP 프록시

`adobe_backend.target_backend.target_main.register_target_routes(app)` 이 **`prefix=/api`** 인 `APIRouter`를 붙인다. 구현은 **`target_adobe_router.py`** 한 파일에 주석으로 구역 나눔(offers / profile-test / recommendation-test).

### 5.1 SDK·식별자 (요약)

- Delivery JSON의 방문자 객체 키는 **`id`** 이고, 그 안에 `tntId`, `thirdPartyId` 등이 온다.
- Python `delivery_api_client`에서는 이 객체 타입이 **`VisitorId`** 라는 이름으로 생성된다(OpenAPI 제너레이터). 코드에서는 `DeliveryRequest(..., id=VisitorId(...))` 형태로 조립하고, HTTP로 나갈 때는 SDK가 명세대로 직렬화한다.

### 5.2 엔드포인트 요약

| 메서드·경로 | 용도 |
|-------------|------|
| `POST /api/target/offers` | 기본 오퍼 조회. `mbox_name` 생략 시 `config.adobe.json`의 `offer_mbox_name`. `params` → mbox **`parameters`**. |
| `POST /api/target/profile-test` | 동일 기본 mbox로 **`profile_parameters`** 만 실어 프로필·Audience 검증. 응답에 `offers`, `response_tokens` 등. |
| `POST /api/target/recommendation-test` | **`mboxes.recs_mbox_name`**. `entity.id`·**`entity.categoryId`**(비어 있거나 `ss` 이면 mbox 파라미터에서 생략)·**`price`**·`Order`. `recipient_id`→`thirdPartyId`. 응답에 `recommendations` 등. |

공통 응답 필드: `tntId`, `thirdPartyId`, `target_cookie`, `target_location_hint_cookie` 등은 `_id_and_cookies`로 정리해 프론트가 다음 호출에 재사용할 수 있다.

### 5.3 오류

- 설정 오류·URL 파싱: **400**.
- Adobe API 예외: 상태에 따라 **400** 또는 **502** 및 본문 요약.
- `AT_DEBUG_DELIVERY=1` 시 요청/응답 디버그 로그.

---

## 6. 에러·운영

- DB 오류: `503` 등 앱 정책에 따름.
- cursor 절반만 오면 `400`.
- CORS는 설정 파일 기준.

---

## 7. 고객 안내 포인트

- 쿠폰 API는 조회 전용이다.
- Target 자격은 **`backend/env/config.adobe.json`** 에만 두고 앱 DB 설정과 섞지 않는다.
- 동일 라우터 파일에서 세 엔드포인트가 공유 헬퍼(`build_delivery_id`, `offers_from_execute`, `_sdk_opts`, `_id_and_cookies`)를 쓴다.
