# AT_TEST_PAGE 제품 요구사항 명세서 (PRD)

| 문서 정보 | 내용 |
|-----------|------|
| 제품명 | AT_TEST_PAGE |
| 문서 버전 | 1.2 |
| 기준 시스템 | Expo(웹+Android) + FastAPI(쿠폰 API + Adobe Target Delivery 프록시) + PostgreSQL |
| 문서 범위 | 제품 개요·핵심 기능·수용 기준 |

---

## 1. 문서 목적

이 문서는 **AT_TEST_PAGE**가 무엇을 제공하는지, 누가 쓰는지, 어떤 범위까지 보장하는지 한 문서 안에서 정의한다.

---

## 2. 제품 한눈에 보기

### 2.1 한 줄 정의

**AT_TEST_PAGE**는 설정 파일 기반으로 이미지·캐러셀 콘텐츠를 바꾸고, 웹에서 쿠폰 데이터를 조회·CSV로 내려받으며, Adobe Target Delivery를 백엔드 프록시로 호출해 오퍼·프로필·추천 시나리오를 시험할 수 있는 테스트/데모용 애플리케이션이다.

### 2.2 핵심 가치

- **단일 코드베이스**로 웹과 Android를 함께 빌드한다.
- 이미지/라벨은 `frontend/env/config.*.json` 수정으로 변경 가능하다.
- 쿠폰 목록은 FastAPI `GET /api/coupons`·CSV API로 조회·다운로드한다.
- Adobe Target은 브라우저 SDK 없이 **`POST /api/target/*`** 프록시로 호출하며, 메인 오퍼·프로필 파라미터 검증·Recommendations 검증 화면을 분리해 둔다.

### 2.3 대상 사용자

- 운영/기획: 이미지·문구·쿠폰 샘플·Target 오퍼 동작 확인
- 개발/QA: 웹·Android 동작, API·Target 연동 검증

---

## 3. 시스템 구성 요약

### 3.1 아키텍처

```text
[사용자 브라우저 / Android 앱]
            |
            v
[Frontend: Expo Router]
  - 라우트: / (메인), /profile-test, /recommendation-test
  - 하단 푸터로 위 세 화면 전환
            |
            v
[Backend: FastAPI]
  - /api/coupons, /api/coupons/csv
  - /api/target/offers, /api/target/profile-test, /api/target/recommendation-test
            |
            v
[PostgreSQL: test_coupons_data]   [Adobe Target Delivery API — SDK 경유]
```

### 3.2 환경별 설정

| 구분 | 경로 |
|------|------|
| 프론트 화면·API 베이스 URL | `frontend/env/config.dev.json`, `frontend/env/config.prd.json` |
| 백엔드 API·DB·CORS | `backend/env/config.dev.json`, `backend/env/config.prd.json` |
| Adobe Target 자격·mbox 기본값 | `backend/env/config.adobe.json` (Git 제외, example 템플릿 제공) |

주요 키: `app_title`, `images`, `api_url` / `api_base_url`, `db.*`, `cors_origins`, Adobe 쪽 `client`, `organization_id`, `property_token`, `offer_mbox_name` 등.

---

## 4. 주요 기능

### 4.1 이미지 캐러셀·갤러리

- 메인 캐러셀에서 이미지 순환 전환.
- 갤러리에서 항목 선택 시 캐러셀 인덱스와 동기화.
- 갤러리 영역 표시/숨김 토글.

### 4.2 쿠폰 데이터 조회(웹 전용)

- 컬럼: `created`, `campaign_label`, `workflow_label`, `coupon_id`.
- keyset 페이징(이전/다음), 페이지 직접 입력, 맨앞/맨뒤.
- 현재 조회 범위 CSV 다운로드.

### 4.3 Adobe Target (웹 중심)

- **메인(`/`)**: 앱 로드 시 오퍼 프리로드, 캐러셀·갤러리 클릭 시 `parameters`와 함께 재조회. JSON 오퍼 중 `type: "event-popup"`이면 모달(`EventPopup`)로 표시.
- **프로필 테스트(`/profile-test`)**: `profile_parameters`를 보내 프로필 스크립트·Audience 매칭을 검증. Re-fetch 시 `event-popup` 오퍼가 있으면 동일 모달 UI.
- **추천 테스트(`/recommendation-test`)**: 음료·푸드 메뉴 엔티티만 선택해 Recommendations용 mbox에 `entity.id` 등을 실어 호출하고(장소 카테고리 `ss` 는 제외), 응답의 추천 목록을 화면에 표시.

### 4.4 공통 내비게이션

- 모든 화면 하단 **푸터**에서 메인·프로필 테스트·추천 테스트로 이동(`router.replace`).

### 4.5 공통 UX

- 로딩·에러 안내·접근성 라벨.

---

## 5. 범위 정의

### 5.1 In Scope

- 웹+Android 단일 코드베이스, Expo Router 다중 라우트.
- 이미지 캐러셀/갤러리/토글, 웹 쿠폰 테이블·CSV.
- Adobe Target Delivery 프록시 3종(offers, profile-test, recommendation-test) 및 위 테스트 화면.
- 전역 하단 푸터.

### 5.2 Out of Scope

- 로그인·권한 체계, CUD가 아닌 쿠폰 데이터 편집 UI.
- iOS 전용 배포 파이프라인 상세, 앱 내 CMS.

---

## 6. 수용 기준 (Acceptance Criteria)

1. 앱 헤더 타이틀이 프론트 `config`의 `app_title`과 일치한다.
2. `images`만 수정해도 캐러셀·갤러리 표시가 바뀐다.
3. 갤러리 선택이 캐러셀 현재 이미지에 반영된다.
4. 웹에서 쿠폰 목록·페이징·CSV가 동작한다.
5. 하단 푸터에서 `/`, `/profile-test`, `/recommendation-test`로 이동할 수 있다.
6. 메인에서 Target 오퍼 프리로드·클릭 후 재조회가 가능하다(설정·CORS·자격이 갖춰진 경우).
7. 프로필 테스트에서 `POST /api/target/profile-test` 호출·JSON 응답 표시·조건 충족 시 `event-popup` 모달이 뜬다.
8. 추천 테스트에서 `POST /api/target/recommendation-test` 호출·응답 JSON·추천 슬롯 갱신이 가능하다(Activity·카탈로그 준비 시).
9. API 오류 시 사용자에게 실패가 전달된다.
