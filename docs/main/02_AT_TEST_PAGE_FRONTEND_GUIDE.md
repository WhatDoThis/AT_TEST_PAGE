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
├─ ga4_frontend/
│  └─ ga4-test/            # GA4 dataLayer 모의(코어·이벤트·부트스트랩·테스트 패널) — §8
├─ app/+html.tsx           # (웹) 루트 HTML 셸 — dataLayer 초기화 + Adobe Tags 자리(§8)
└─ assets/images/
```

`tsconfig.json`: `@/*` → `frontend/*`, `@adobe/*` → `target_frontend/*`, `@adobe-native/*` → `target-native-frontend/*`, `@ga4/*` → `ga4_frontend/ga4-test/*`.

---

## 3. 루트 레이아웃·헤더·배너·푸터

### 3.1 `app/_layout.tsx`

- `TargetAppProvider` → `VisitorProvider`(회선 로그인) → `RootLayoutInner`.
- **`TargetPageBootstrap`**: 웹=bootstrap `POST /api/target/offers`(배너 mbox 동봉), 네이티브=`banner_sdk_mbox_names` SDK 일괄 조회 → 동일 파서·Context.
- **`bannersReady`**: bootstrap/SDK 완료 전 `TopBanner`/`BottomBanner` 미렌더(placeholder 깜빡임 방지).
- 레이아웃 순서: `AppHeader` → `TopBanner` → `Stack` → `BottomBanner` → `AppFooter`.

### 3.2 `components/AppHeader.tsx` · `login/`

- 좌측: `config.app_title`. 우측: **`VisitorMenu`** — 로그인 회선 라벨 또는 로그인 버튼.
- **`LoginModal`** (`mode`: `choice` → `table` | `input`):
  - **방식 선택**: 테이블 선택 / 아이디 입력 카드.
  - **테이블 선택**: `enterTable` 시 `GET /api/telecom/lines` → 행 선택 → `VisitorContext.login` → `thirdPartyId`·`refreshOffers`.
  - **아이디 입력**: `U000000001`~`U005122768` 검증(`_normalizeCustomerId`) 후 API 없이 `line_id`로 동일 `login` 호출(5G 등 API 미도달 환경에서 Target 개인화 테스트용).

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

### 6.2 EAS 빌드와 저장소 루트 `.easignore`

- EAS는 **저장소 루트**를 아카이브 루트로 업로드한다. `frontend/.easignore`는 **적용되지 않는다** — 반드시 **루트** `/.easignore`를 둔다.
- `.easignore`가 있으면 EAS는 `.gitignore` 대신 이 파일로 업로드 대상을 정한다.
- `frontend/env/config.{dev,prd}.json`은 Git 제외지만 `loadConfig.ts` **정적 import**에 필수이므로 루트 `.easignore`에서 **제외하지 않는다**(빌드 머신에 파일이 있으면 아카이브에 포함).
- `backend/`·`docs/` 등 앱 빌드 불필요 경로는 루트 `.easignore`에서 제외(민감정보·용량 절감).
- **서버 git pull 빌드**: 로컬 커밋·푸시 → 서버 `git pull` → `frontend/env/config.*.json` 존재 확인 → `cd frontend && eas build ...`. 상세·검증은 `04` §16.

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

---

## 8. GA4 dataLayer 모의(Mock) — Adobe Tags 연동 테스트용

실제 GA4(gtag.js)·GTM 컨테이너 없이 `window.dataLayer` 배열을 생성·push 하는 테스트 환경. Adobe Data Collection(Tags)의 **Google Data Layer Extension** 이 이 dataLayer 를 읽어 Data Element/Rule 로 활용하는지 검증하는 용도다. 유플홈(U+) GA4 dataLayer 구조(`nuxtRoute`·`behavior_var` 등)를 모방한다.

> **운영이 아니라 테스트 목적:** GA4/GTM 실 스크립트는 **로드하지 않는다**(순수 JS 배열). Adobe Tags(Launch) 임베드 스크립트도 필수 아님 — `+html.tsx`에 위치만 주석으로 잡아두고, 검증은 브라우저 콘솔/Adobe Experience Platform Debugger 로 한다. (embed 를 실제로 넣어야 하는 건 "Extension 이 dataLayer 를 집어가는지"의 end-to-end 검증뿐.)

### 8.1 로드 순서와 초기화 (`app/+html.tsx`)

Expo Router 웹 루트 HTML 셸에서 순서를 강제한다.

1. **dataLayer 초기화**(가장 먼저): `window.dataLayer = window.dataLayer || [];` — HTML 파싱 즉시(React 마운트 이전) 빈 배열 생성.
2. **Adobe Tags(Launch) 임베드 자리**: 주석으로 위치만 확보(실 스크립트는 추후).
3. **스타일 리셋**(`ScrollViewStyleReset`).

즉 "배열 생성"은 페이지 로드 맨 앞(head), "초기 이벤트 push"는 앱 마운트 직후(§8.3)에 일어난다.

### 8.2 패키지 구조 (`ga4_frontend/ga4-test/`, 별칭 `@ga4/*`)

| 파일 | 역할 |
|------|------|
| `ga4DataLayer.types.ts` | 스키마 타입(`Ga4DataLayerItem`·`Ga4BehaviorVar`·`Ga4NuxtRouteEvent`) |
| `ga4DataLayer.ts` | 코어 — `ensureDataLayer`/`dataLayerPush`/`getDataLayer`/`nextUniqueEventId`/`isGa4Supported`(window 가드) |
| `ga4Events.ts` | 부트스트랩(gtm.js·nuxtRoute·gtm.dom·gtm.load) + `behavior_var` 프리셋·`pushPageViewPreset` (인터랙션은 재-export) |
| `ga4Events_interaction.ts` | 인터랙션(productClick·signUp·login·gtm.click·custom) |
| `Ga4PageBootstrap.tsx` | 페이지 로드 자동 push(웹 1회 가드, 렌더 없음) |
| `Ga4TestPanel.tsx` | 버튼(페이지뷰 프리셋·인터랙션) + 실시간 dataLayer 모니터(RN, 네이티브는 안내) |

마운트: `app/main.tsx` 에 `<Ga4PageBootstrap />` + `<Ga4TestPanel />`.

### 8.3 이벤트 설계 (실제 규격 모방 + mock 정직성)

- **GTM 예약 필드는 자동 생성**: `gtm.start`=`Date.now()`, `gtm.uniqueEventId`=모듈 카운터(하드코딩·중복 gtm.js 재현 안 함). `event` 키는 모든 push 에 존재(Adobe Rule 감지 핵심).
- **`behavior_var` 는 핵심 알맹이**로 그대로 유지하되, **실제 샘플에 존재하는 3개 필드만** 사용: `behavior_channel_type`·`behavior_host_type`·`site_category`(`"환경|채널|세그먼트"`). *(참고: 인수인계 문서에 `screen_id`/`content_group`/`site_type` 등 추가 필드가 확정되면 그때 반영한다 — 현재 저장소·문서엔 근거 없어 넣지 않음.)*
- **오디언스 조건 테스트용 프리셋**: `pushPageViewPreset(pc_main|mobile_main|pc_test|mobile_test)` — 환경(PC/Mobile) × 채널을 다르게 주입해 `behavior_var` 조합을 바꾼다. 패널에 프리셋 페이지뷰 버튼으로 노출.
- **`gtm.click` 간소화**: 실제의 `gtm.element`(DOM 참조) 대신 문자열 필드(`gtm.elementText`/`Classes`/`Id`)만 담아 재현.

### 8.4 검증

```bash
cd frontend && npx expo start --web
```

- 콘솔에 `dataLayer` → `event:'nuxtRoute'` + `pageTitle`/`pageType`/`pageUrl`/`routeName`/`behavior_var` 확인.
- `/at-test/main` 하단 "dataLayer 테스트 패널" 버튼 클릭 → 모니터에 새 객체 실시간 추가.
