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
| 라우팅 | `app/` 파일 기반 (`index`, `profile-test`, `recommendation-test`) |

### 1.2 라우트와 화면

| 경로 | 파일 | 내용 |
|------|------|------|
| `/` | `app/index.tsx` | `/main` 으로 리다이렉트 |
| `/main` | `app/main.tsx` | 캐러셀·토글·갤러리·쿠폰(웹)·Target Context·`EventPopup` |
| `/profile-test` | `app/profile-test.tsx` | `ProfileTestPanel` — profile 검증 |
| `/recommendation-test` | `app/recommendation-test.tsx` | `RecommendationTestPanel` — Recs 검증 |

모든 화면은 `app/_layout.tsx`에서 **`Stack` + 하단 `AppFooter`** 로 감싸져, 푸터에서 위 세 경로로 `router.replace` 이동한다.

---

## 2. 디렉터리 구조 (요약)

```text
frontend/
├─ app/
│  ├─ _layout.tsx          # Stack, TargetAppProvider, TargetPageBootstrap, AppFooter
│  ├─ index.tsx            # 메인
│  ├─ profile-test.tsx
│  └─ recommendation-test.tsx
├─ components/
│  ├─ AppFooter.tsx        # 메인 / 프로필 테스트 / 추천 테스트 전역 푸터
│  ├─ ImageCarousel.tsx    # → adobe_frontend … targetImageCarousel 브리지
│  ├─ ImageGallery.tsx
│  ├─ ToggleButton.tsx
│  ├─ CouponTable.tsx
│  ├─ EventPopup.tsx       # → adobe EventPopup 브리지
│  └─ …
├─ context/
│  └─ AdobeTargetContext.tsx  # → adobe targetContext 브리지
├─ utils/
│  ├─ loadConfig.ts        # dev/prd JSON, api_url·adobe_mboxes(offer/bootstrap mbox) 등
│  └─ imageMap.ts
├─ adobe_frontend/target_frontend/
│  ├─ app/targetApp.tsx           # TargetAppProvider
│  ├─ app/TargetPageBootstrap.tsx # 웹 첫 로드: bootstrap mbox → POST /api/target/offers
│  ├─ context/targetContext.tsx   # 오퍼·event-popup 상태, refreshOffers
│  ├─ components/
│  │  ├─ EventPopup.tsx
│  │  ├─ ProfileTestPanel.tsx
│  │  ├─ RecommendationTestPanel.tsx
│  │  ├─ targetImageCarousel.tsx
│  │  └─ …
│  └─ utils/
│     ├─ targetOffersFetch.ts      # POST /api/target/offers
│     ├─ targetProfileTest.ts      # POST /api/target/profile-test
│     ├─ targetRecommendationTest.ts  # POST /api/target/recommendation-test
│     ├─ targetSession.ts          # AT_* (공통 오퍼), AT_RECS_* (추천 테스트 전용)
│     ├─ targetOfferParser.ts      # event-popup·캐러셀 파싱
│     └─ clickCookie.ts
└─ assets/images/
```

`tsconfig.json` 경로 별칭: `@/*` → `frontend/*`, `@adobe/*` → `frontend/adobe_frontend/target_frontend/*`.

---

## 3. 루트 레이아웃·푸터

### 3.1 `app/_layout.tsx`

- 최상위 `TargetAppProvider`로 앱 트리를 감싼다.
- 웹에서 `TargetPageBootstrap`이 DOM 준비 후 **bootstrap mbox**(`frontend/env`의 `adobe_mboxes.bootstrap_mbox_name`, 기본 `target-ready-mbox`)로 `POST /api/target/offers`를 한 번 호출해 Context를 채운다.
- `GestureHandlerRootView` 안에 `flex:1` 영역에 `Stack`, 그 아래 **`AppFooter`** 를 고정한다.
- Stack `headerTitle`은 `config.app_title`.

### 3.2 `components/AppFooter.tsx`

- `usePathname`으로 현재 탭 강조.
- `router.replace("/")`, `"/profile-test"`, `"/recommendation-test"` — 동일 탭 재클릭 시 noop.

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

### 5.2 세션 저장소 (`targetSession.ts`)

- **`AT_*` 키** (`at_tntId`, `at_thirdPartyId`, `at_target_cookie_value`, `at_location_hint`, `at_session_id`): 메인 오퍼·`getAdobeTargetVisitorPayload()`가 사용. `targetProfileTest`도 동일 키로 프로필 테스트와 offers 컨텍스트를 맞춘다.
- **`AT_RECS_*` 키** (`AT_RECS_TNTID`, `AT_RECS_TARGET_COOKIE`, `AT_RECS_LOCATION_HINT`, `AT_RECS_RECIPIENT_ID`): 추천 테스트만 사용. offers·프로필과 저장소를 섞지 않는다.

### 5.3 유틸 ↔ UI 짝

| 유틸 | 화면/역할 |
|------|-----------|
| `targetOffersFetch.ts` | 프리로드·`refreshOffers`, 메인 캐러셀/갤러리 |
| `targetProfileTest.ts` | `ProfileTestPanel` |
| `targetRecommendationTest.ts` | `RecommendationTestPanel` — 페이로드(`entity_id`·`entity_category_id` **`ss` 제외**·`price`·`recipient_id` 등), 성공 시 **`AT_RECS_*`** 에 tnt·쿠키·location_hint 반영, 오류 시 `detail` 파싱 |

### 5.4 `event-popup` 모달

- `targetOfferParser.parseAdobeTargetOffersPayload`가 오퍼 `content.type === "event-popup"`을 골라낸다.
- 메인: Context에 올린 뒤 루트의 `EventPopup` 브리지로 표시.
- 프로필 테스트: `ProfileTestPanel`이 Re-fetch 응답에서 동일 파서로 추출 후 **`adobe_frontend`의 `EventPopup`** 을 직접 렌더한다.

---

## 6. 설정 연동

### 6.1 프론트 env JSON

- 개발: `frontend/env/config.dev.json`
- 운영 번들: `frontend/env/config.prd.json`

`utils/loadConfig.ts`가 `__DEV__`로 파일을 고른다. **Adobe 자격은 이 JSON에 넣지 않는다** (백엔드 `config.adobe.json`만 사용).

### 6.2 메인 설정 키

| 키 | 사용처 |
|----|--------|
| `app_title` | Stack 헤더 |
| `images` | 캐러셀·갤러리 |
| `api_url` / `api_base_url` | 쿠폰 API·Target `fetch` 베이스 |

---

## 7. 고객 안내 포인트

- 이미지·문구는 프론트 env JSON만으로 바꿀 수 있다.
- 쿠폰 테이블은 keyset 페이징을 포함한다.
- Target은 웹에서 전체 흐름이 가장 완전하다(프리로드·클릭·테스트 라우트).
- 추천·프로필 화면은 운영 메인과 session 키를 일부 나눠, 실험이 메인 세션을 덮어쓰지 않도록 한다(`AT_RECS_*`).
