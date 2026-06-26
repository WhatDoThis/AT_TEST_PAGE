# AT_TEST_PAGE 제품 요구사항 명세서 (PRD)

| 문서 정보 | 내용 |
|-----------|------|
| 제품명 | AT_TEST_PAGE |
| 문서 버전 | 1.3 |
| 기준 시스템 | Expo(웹+Android) + FastAPI(쿠폰 API + Adobe Target Delivery 프록시) + PostgreSQL |
| 문서 범위 | 제품 개요·핵심 기능·수용 기준 |

---

## 1. 문서 목적

이 문서는 **AT_TEST_PAGE**가 무엇을 제공하는지, 누가 쓰는지, 어떤 범위까지 보장하는지 한 문서 안에서 정의한다.

---

## 2. 제품 한눈에 보기

### 2.1 한 줄 정의

**AT_TEST_PAGE**는 설정 파일 기반으로 이미지·캐러셀 콘텐츠를 바꾸고, 웹에서 쿠폰 데이터를 조회·CSV로 내려받으며, Adobe Target을 **웹은 백엔드 프록시**·**Android는 Mobile SDK**로 호출해 오퍼·프로필·추천·띠배너·회선 기반 개인화 시나리오를 시험할 수 있는 테스트/데모용 애플리케이션이다.

### 2.2 핵심 가치

- **단일 코드베이스**로 웹과 Android를 함께 빌드한다.
- 이미지/라벨은 `frontend/env/config.*.json` 수정으로 변경 가능하다.
- 쿠폰 목록은 FastAPI `GET /api/coupons`·CSV API로 조회·다운로드한다.
- Adobe Target은 브라우저 SDK 없이 **웹: `POST /api/target/*` 프록시**, **Android: Mobile SDK**로 호출하며, 메인 오퍼·띠배너·프로필·추천·네이티브 XT/A·B/추천 SDK 테스트 화면을 분리해 둔다.
- **회선 로그인(데모)**: 통신사 테스트 DB 회선을 선택하면 `line_id`를 Target `thirdPartyId`로 주입해 오퍼·배너를 개인화한다(운영 로그인·권한 체계 아님).

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
  - 라우트: /main, /profile-test, /recommendation-test, /scroll-test,
            /xttest, /abtest, /recommendation (`/` → /main 리다이렉트)
  - 전역: AppHeader(로그인) · Top/Bottom 띠배너 · 하단 푸터(7탭·2줄)
            |
            v
[Backend: FastAPI]
  - /api/coupons, /api/coupons/csv
  - /api/telecom/lines, /api/telecom/lines/{line_id}
  - /api/target/offers, /api/target/profile-test, /api/target/recommendation-test
            |
            v
[PostgreSQL: test_coupons_data]   [PostgreSQL: lgu_target_test — telecom_test_lines]
            |
            v
[Adobe Target Delivery API — 웹=Python SDK 프록시 / 네이티브=Mobile SDK 직접]
```

### 3.2 환경별 설정

| 구분 | 경로 |
|------|------|
| 프론트 화면·API 베이스 URL | `frontend/env/config.{dev,prd}.json` (**Git 제외**, `config.{dev,prd}.example.json` 복사) |
| 백엔드 API·DB·CORS | `backend/env/config.{dev,prd}.json` |
| 백엔드 통신사 테스트 DB | `backend/env/config.{dev,prd}.json` 의 **`telecom_db`** 블록 |
| Adobe Target 자격·mbox 기본값 | `backend/env/config.adobe.json` (Git 제외, example 템플릿 제공) |

주요 키: `app_title`, `images`, `api_url`, `db.*`, `telecom_db.*`, `cors_origins`, Adobe `client`·`organization_id`·`property_token`·`mboxes.*`(offer/recs/bootstrap/**banner_mbox_names**). 프론트 `mobile_env`는 네이티브 SDK 전용(appId·property token·Assurance·`adobe_sdk_mboxes`).

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

### 4.3 Adobe Target

- **메인(`/main`)**: bootstrap mbox로 오퍼 프리로드(캐러셀·`event-popup`·상/하단 띠배너). 갤러리 클릭 시 `parameters`와 함께 재조회.
- **프로필 테스트(`/profile-test`)**: `profile_parameters` 전송·Audience 매칭 검증. Re-fetch 시 `event-popup` 모달.
- **추천 테스트(`/recommendation-test`)**: Recommendations mbox 호출·응답 목록 표시.
- **네이티브 전용**: `/xttest`(XT·event-popup), `/abtest`(global mbox·`imageUrl` A/B), `/recommendation`(추천 SDK·데이터 적재).
- **띠배너**: 웹은 `AppHeader` 아래·`AppFooter` 위 전역. 네이티브도 동일 UI(`banner_sdk_mbox_names` 일괄 조회). JSON 오퍼 계약은 `04` 부록 C.

### 4.4 회선 로그인(데모)

- 헤더 우측 **로그인** → `GET /api/telecom/lines` 목록에서 회선 1건 선택.
- 선택 `line_id`를 Target **`thirdPartyId`**(웹 세션 / 네이티브 `setThirdPartyId`)로 주입 후 `refreshOffers`로 오퍼·배너 즉시 재조회.
- 속성 참고: `docs/files/telecom_attributes.csv`.

### 4.5 공통 내비게이션

- 모든 화면 하단 **푸터 7탭(2줄)**: 메인·프로필·추천·스크롤 / XT·A·B·추천 SDK.

### 4.6 공통 UX

- 로딩·에러 안내·접근성 라벨.

---

## 5. 범위 정의

### 5.1 In Scope

- 웹+Android 단일 코드베이스, Expo Router 다중 라우트(웹 Target + 네이티브 SDK 테스트 화면).
- 이미지 캐러셀/갤러리/토글, 웹 쿠폰 테이블·CSV.
- Adobe Target Delivery 프록시 3종 + Mobile SDK 네이티브 경로.
- 전역 띠배너·회선 로그인(데모)·`GET /api/telecom/lines`.
- 전역 하단 푸터(7탭).

### 5.2 Out of Scope

- 운영용 로그인·권한·세션 보안, CUD가 아닌 쿠폰 데이터 편집 UI.
- iOS 전용 배포 파이프라인 상세, 앱 내 CMS.

---

## 6. 수용 기준 (Acceptance Criteria)

1. 앱 헤더 타이틀이 프론트 `config`의 `app_title`과 일치한다.
2. `images`만 수정해도 캐러셀·갤러리 표시가 바뀐다.
3. 갤러리 선택이 캐러셀 현재 이미지에 반영된다.
4. 웹에서 쿠폰 목록·페이징·CSV가 동작한다.
5. 하단 푸터에서 `/main`, `/profile-test`, `/recommendation-test` 및 네이티브 테스트 라우트로 이동할 수 있다.
6. 메인에서 Target bootstrap 오퍼·클릭 후 재조회가 가능하다(설정·CORS·자격이 갖춰진 경우).
7. 프로필 테스트에서 `POST /api/target/profile-test` 호출·JSON 응답·조건 충족 시 `event-popup` 모달이 뜬다.
8. 추천 테스트에서 `POST /api/target/recommendation-test` 호출·응답 JSON·추천 슬롯 갱신이 가능하다.
9. 회선 로그인 후 `line_id`가 Target 식별자로 반영되고 오퍼·띠배너가 재조회된다.
10. 상/하단 띠배너가 bootstrap(웹) 또는 SDK 배치(네이티브) 완료 후 placeholder 깜빡임 없이 표시된다.
11. API 오류 시 사용자에게 실패가 전달된다.
