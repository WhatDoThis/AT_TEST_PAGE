# AT_TEST_PAGE 프론트엔드 가이드

본 문서는 `frontend/` 기준 **현재 구현**만으로 화면·라우팅·Adobe Target 프론트 패턴·설정 연동을 파악할 수 있게 정리한다.

- Adobe Target **엔드포인트·브리지·저장소 구조**는 `docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md` 를 본다.

---

## 1. 개요

### 1.1 기술 스택

| 항목 | 내용 |
|------|------|
| 프레임워크 | Expo (React Native + Expo Router) |
| 대상 | Web, Android |
| 언어 | TypeScript/TSX |
| 라우팅 | `app/` 파일 기반 — 아래 §1.2 표 참고 |

### 1.2 라우트와 화면

| 경로 | 파일 | 내용 |
|------|------|------|
| `/` | `app/index.tsx` | `/main` 리다이렉트 |
| `/main` | `app/main.tsx` | 캐러셀·토글·갤러리·쿠폰(웹)·`EventPopup` |
| `/profile-test` | `app/profile-test.tsx` | `ProfileTestPanel` |
| `/recommendation-test` | `app/recommendation-test.tsx` | `RecommendationTestPanel` |
| `/scroll-test` | `app/scroll-test.tsx` | 스크롤 이벤트 테스트(1~500) |
| `/xttest` | `app/xttest.tsx` | 네이티브 XT·event-popup (`XtTestScreen`) |
| `/abtest` | `app/abtest.tsx` | 네이티브 A/B 이미지 (`AbTestScreen`) |
| `/recommendation` | `app/recommendation.tsx` | 네이티브 추천 SDK (`RecommendationScreen`) |

`app/_layout.tsx`에서 **`AppHeader`(로그인) → `TopBanner` → `Stack` → `BottomBanner` → `AppFooter`** 순으로 전역 배치. 푸터는 탭 **7개·2줄(4+3)**.

---

## 2. 디렉터리 구조 (요약)

```text
frontend/
├─ app/
│  ├─ _layout.tsx          # AppHeader, Top/BottomBanner, TargetAppProvider, TargetPageBootstrap, AppFooter
│  ├─ index.tsx, main.tsx, profile-test.tsx, recommendation-test.tsx
│  ├─ scroll-test.tsx, xttest.tsx, abtest.tsx, recommendation.tsx
├─ .easignore              # EAS 업로드 제외 목록(env/config.*.json 은 포함 유지)
├─ components/
│  ├─ AppHeader.tsx        # 앱 타이틀 + VisitorMenu(로그인)
│  ├─ AppFooter.tsx        # 7탭 푸터(2줄)
│  ├─ banners/             # StripBanner, TopBanner, BottomBanner, useCountdown, openBannerCta
│  ├─ login/               # LoginModal, VisitorMenu, telecomLinesApi
│  ├─ ImageCarousel.tsx    # → adobe targetImageCarousel 브리지
│  ├─ CouponTable.tsx, EventPopup.tsx, …
├─ context/
│  ├─ AdobeTargetContext.tsx   # → adobe targetContext 브리지
│  └─ VisitorContext.tsx       # → adobe visitorContext 브리지
├─ utils/loadConfig.ts     # dev/prd JSON, mobile_env
├─ adobe_frontend/
│  ├─ target_frontend/     # 웹 Target(Provider, Bootstrap, fetch, parser, 테스트 패널)
│  └─ target-native-frontend/  # XtTestScreen, AbTestScreen, RecommendationScreen, adobeMobileTarget
└─ assets/images/
```

`tsconfig.json`: `@/*` → `frontend/*`, `@adobe/*` → `target_frontend/*`, `@adobe-native/*` → `target-native-frontend/*`.

---

## 3. 루트 레이아웃·헤더·배너·푸터

### 3.1 `app/_layout.tsx`

- `TargetAppProvider` → `VisitorProvider`(회선 로그인) → `RootLayoutInner`.
- **`TargetPageBootstrap`**: 웹=bootstrap `POST /api/target/offers`(배너 mbox 동봉), 네이티브=`banner_sdk_mbox_names` SDK 일괄 조회 → 동일 파서·Context.
- **`bannersReady`**: bootstrap/SDK 완료 전 `TopBanner`/`BottomBanner` 미렌더(placeholder 깜빡임 방지).
- 레이아웃 순서: `AppHeader` → `TopBanner` → `Stack` → `BottomBanner` → `AppFooter`.

### 3.2 `components/AppHeader.tsx` · `login/`

- 좌측: `config.app_title`. 우측: **`VisitorMenu`** — 로그인 회선 라벨 또는 로그인 버튼.
- **`LoginModal`**: `GET /api/telecom/lines` 테이블에서 회선 선택 → `VisitorContext.login` → `line_id`를 `thirdPartyId`로 주입·`refreshOffers`.

### 3.3 `components/AppFooter.tsx`

- 7탭·2줄, `useSafeAreaInsets`로 하단 inset 반영.
- `router.replace`로 각 라우트 이동(동일 탭 재클릭 noop).

---

## 4. 메인 화면 `app/main.tsx`

- 상태: `carouselIndex`, `galleryOpen`.
- `ImageCarousel`에 `useAdobeTargetOffer()` 결과를 `adobeOffer`로 전달.
- `useAdobeTargetEventPopup()`으로 `EventPopup` 제어.
- `CouponTable`은 웹에서만 의미 있는 UI(`Platform` 분기는 컴포넌트 내부).

---

## 5. Adobe Target 프론트 패턴

### 5.1 API 베이스 URL

`targetOffersFetch.ts`, `targetProfileTest.ts`, `targetRecommendationTest.ts`는 공통으로  
`config.api_base_url ?? config.api_url ?? "http://localhost:8010"` 을 쓴다.

### 5.2 세션 저장소

- **`sessionStore.ts`**: 웹=`sessionStorage`, 네이티브=메모리+`AsyncStorage`(앱 시작 시 hydrate).
- **`targetSession.ts`**: `AT_*`(오퍼·프로필), `AT_RECS_*`(추천 테스트 전용), `at_login_line`(회선 로그인 표시 복원).

### 5.3 유틸 ↔ UI 짝

| 유틸 | 화면/역할 |
|------|-----------|
| `targetOffersFetch.ts` | 프리로드·`refreshOffers`, 메인 캐러셀/갤러리 |
| `targetProfileTest.ts` | `ProfileTestPanel` |
| `targetRecommendationTest.ts` | `RecommendationTestPanel` — 페이로드(`entity_id`·`entity_category_id` **`ss` 제외**·`price`·`recipient_id` 등), 성공 시 **`AT_RECS_*`** 에 tnt·쿠키·location_hint 반영, 오류 시 `detail` 파싱 |

| `targetOfferParser.ts` | `event-popup`·`top-banner`·`bottom-banner`·캐러셀·배열 content |
| `visitorContext.tsx` | 회선 로그인 → `thirdPartyId` / `setThirdPartyId` → `refreshOffers` |

### 5.4 `event-popup`·띠배너

- JSON 오퍼 계약·샘플: `04` **부록 C**.
- 띠배너: `endAt` 카운트다운·`expiredTitle`·`ctaTarget`(`_self`/`_blank`) 지원.

---

## 6. 설정 연동

### 6.1 프론트 env JSON

- `frontend/env/config.{dev,prd}.example.json` 복사 → `config.{dev,prd}.json` (**Git 제외**).
- `loadConfig.ts`가 **정적 import**로 위 JSON을 읽고 `__DEV__`로 dev/prd를 선택. **웹 mbox 이름은 프론트에 두지 않음**(백엔드 `config.adobe.json`).

### 6.2 EAS 빌드와 `frontend/.easignore`

- `.easignore`가 있으면 EAS는 `.gitignore` 대신 이 파일로 업로드 대상을 정한다.
- `config.{dev,prd}.json`은 Git 제외지만 Metro 번들에 **필수**이므로 `.easignore`에서 **제외하지 않는다**(로컬에 파일이 있으면 아카이브에 포함).
- `node_modules`·`.expo`·`dist`·`ios`·`android` 등 산출물만 제외.
- **전제**: `eas build` 실행 머신에 `frontend/env/config.{dev,prd}.json`이 실제 존재해야 한다(리눅스 CI면 example 복사 후 값 입력). 상세는 `04` §16·§19.

### 6.3 주요 키

| 키 | 사용처 |
|----|--------|
| `app_title` | `AppHeader` |
| `images` | 캐러셀·갤러리 |
| `api_url` | 쿠폰·Target·`/api/telecom/lines` |
| `mobile_env.adobe_mobile_app_id` 등 | 네이티브 SDK 초기화 |
| `mobile_env.adobe_sdk_mboxes.*` | offer/global/rec/**banner_sdk_mbox_names** |

---

## 7. 고객 안내 포인트

- 이미지·문구는 프론트 env JSON만으로 바꿀 수 있다.
- 쿠폰 테이블은 keyset 페이징을 포함한다.
- Target 웹은 백엔드 프록시, Android는 Mobile SDK가 주 경로다.
- 회선 로그인은 **데모용**이며 `line_id`→Target 개인화 검증에 쓴다.
- 추천·프로필 화면은 `AT_RECS_*`로 메인 세션과 분리한다.
