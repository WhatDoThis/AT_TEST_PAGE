# AT_TEST_PAGE 프론트엔드 가이드 v1.0

본 문서는 `frontend/` 기준의 실제 구현 내용을 정리한 프론트엔드 상세 문서다.

- 제품 관점 요약: `docs/main/01_AT_TEST_PAGE_PRD.md`
- 백엔드/API 상세: `docs/main/03_AT_TEST_PAGE_BACKEND_GUIDE.md`

---

## 1. 프론트엔드 개요

### 1.1 기술 스택

| 항목 | 내용 |
|------|------|
| 프레임워크 | Expo (React Native + Expo Router) |
| 대상 플랫폼 | Web, Android |
| 언어 | TypeScript/TSX |
| 라우팅 | `app/` 파일 기반 라우팅 |

### 1.2 핵심 화면

- 단일 메인 화면: `frontend/app/index.tsx`
- 루트 레이아웃: `frontend/app/_layout.tsx`

---

## 2. 디렉터리 구조

```text
frontend/
├─ app/
│  ├─ _layout.tsx
│  └─ index.tsx
├─ components/
│  ├─ ImageCarousel.tsx
│  ├─ ToggleButton.tsx
│  ├─ ImageGallery.tsx
│  └─ CouponTable.tsx
├─ utils/
│  ├─ loadConfig.ts
│  └─ imageMap.ts
└─ assets/images/
```

---

## 3. 화면 구성 및 동작

### 3.1 `app/_layout.tsx`

- Expo Router `Stack` 기반 루트 레이아웃
- 헤더 타이틀은 `config.app_title` 사용
- `GestureHandlerRootView`로 하위 화면 감싼다

### 3.2 `app/index.tsx`

- 상태 단일 소스 관리:
  - `carouselIndex`
  - `galleryOpen`
- 화면 구성 순서:
  1. `ImageCarousel`
  2. `ToggleButton`
  3. `ImageGallery`
  4. `CouponTable` (웹 전용 렌더)

### 3.3 `components/ImageCarousel.tsx`

- 이미지 전환 애니메이션(우측에서 진입, 현재 이미지는 좌측 퇴장)
- `currentIndex`, `onIndexChange` props로 부모 상태와 동기화
- 이미지 목록 비어 있을 경우 안내 문구 노출

### 3.4 `components/ToggleButton.tsx`

- 갤러리 보이기/감추기 상태 전환
- 상태에 따라 버튼 라벨 및 접근성 라벨 변경

### 3.5 `components/ImageGallery.tsx`

- 이미지 목록을 한 줄 카드로 표시
- 선택된 항목 번호 강조
- 카드 선택 시 `onSelectIndex` 호출로 캐러셀과 동기화

### 3.6 `components/CouponTable.tsx` (웹 전용)

- `Platform.OS !== "web"`인 경우 렌더하지 않음
- API 호출: `GET {api_url}/api/coupons`
- 페이징:
  - keyset 커서: 이전/다음
  - 페이지 직접 입력(Enter/blur)
  - 맨앞/맨뒤 이동
- CSV 다운로드: `GET {api_url}/api/coupons/csv`

---

## 4. 설정 연동

### 4.1 설정 파일

- 개발: `frontend/env/config.dev.json`
- 운영: `frontend/env/config.prd.json`

`frontend/utils/loadConfig.ts`에서 Expo의 `__DEV__` 값으로 dev/prd 파일을 고정 선택한다.

- `npx expo start` 계열(개발): `config.dev.json`
- `npx expo export --platform web` 계열(프로덕션 번들): `config.prd.json`

### 4.2 프론트에서 사용하는 주요 키

| 키 | 사용 위치 | 설명 |
|----|-----------|------|
| `app_title` | `_layout.tsx` | 상단 헤더 제목 |
| `images` | `ImageCarousel`, `ImageGallery` | 이미지 파일명/라벨 목록 |
| `api_url` | `CouponTable` | 백엔드 API 기본 URL |
| `port`, `base_url` | 운영/접속 기준 값 | 웹 서비스 URL/포트 기준 |

---

## 5. 고객 안내 포인트

- 화면은 단순해 보이지만, 이미지 구성은 설정 파일만으로 바뀌도록 설계되어 운영 편의성이 높다.
- 쿠폰 조회 테이블은 대용량 대응을 위해 커서 기반 이동을 포함한다.
- CSV 다운로드는 프론트 생성 방식이 아닌 서버 생성 방식으로 일관성 있게 제공한다.
- 프론트 설정은 `frontend/env`에만 두어, DB 정보가 앱 번들로 섞이지 않게 분리했다.

---

## 6. 연관 문서

| 문서 | 용도 |
|------|------|
| `01_AT_TEST_PAGE_PRD.md` | 제품 요구사항 요약 |
| `02_AT_TEST_PAGE_FRONTEND_GUIDE.md` | 프론트엔드 상세 구조 (본 문서) |
| `03_AT_TEST_PAGE_BACKEND_GUIDE.md` | 백엔드/API/DB 상세 |
