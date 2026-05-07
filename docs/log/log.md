# Log

## Log Index

55. 2026-05-08 Adobe `config.adobe.json` Git 제외·example 템플릿·프론트 postinstall
54. 2026-05-07 Adobe config.adobe.json 중첩(administration/mboxes) 로드 수정·프론트 mboxes 정규화
53. 2026-05-07 Adobe 설정 경로 명시·프론트 BRIDGE 주석 통일(backend/env·frontend/env config.adobe.json)
52. 2026-05-07 app/config·main 어도비 BRIDGE 주석 보강(위치·구분선)
51. 2026-05-07 Adobe config.adobe.json 을 backend/env·frontend/env 로 이동
50. 2026-05-07 Adobe Target 백·프 패키지 통합 및 config.adobe.json 분리
49. 2026-05-07 Adobe Target 백엔드 mbox 기본값 config 정합(offer_mbox_name·track_mbox_name·Pydantic Field)
48. 2026-05-07 Adobe Target 1차 리팩토링(04 v2.1 런타임·track 응답, 진단 parse_execute 분기)
47. 2026-05-07 docs/main 04 v2.0 Adobe Target 가이드 재작성·PRD 연관 문서(04) 행 추가
46. 2026-05-07 docs/main 04 v1.6 Delivery 클릭 알림 용도(6.3)·tokens 한계(6.4)·로그 40~45·코드 정합
45. 2026-05-07 Adobe Target mbox 이름 frontend/env config 로 분리(offer=target-local-mbox·track=click-tracking-mbox)
44. 2026-05-07 Adobe Target 진단 로그 보강(request 요약 1줄·response.to_dict() 분할 덤프·track 엔드포인트 동일 적용)
43. 2026-05-07 Adobe Target offers 빈 배열 진단 로그 재도입(요청 to_str 분할·응답 page_load.options/mboxes 풀이)
42. 2026-05-07 Adobe Target LocationParseError 원인(ApiClient TypeWithDefault 메타클래스) 진단 및 디버그 코드 제거
41. 2026-05-07 Adobe Target DeliveryRequest.property 직렬화 검증용 디버그(AT_DEBUG_DELIVERY 토글)
40. 2026-05-07 Adobe Target autoPlay 미동작 수정(파서 lenient·진단 로그·MIN 가드 제거)
39. 2026-05-07 Adobe Target 코드 시각 구분(전용/혼합 배너)·파일명 접두사 미적용 정책
38. 2026-05-07 Adobe Target 오퍼 Context·ImageCarousel adobeOffer prop·autoPlay
37. 2026-05-07 docs/main 04 Adobe Target 가이드 v1.3(로그 31~36·코드 정합)
36. 2026-05-07 Adobe Target 글로벌 mbox pageLoad 전환(NoGlobalMbox 400)
35. 2026-05-07 Adobe Target 검증: track·offers 방문자 정합(adobeTargetSession)·docs/main 04 갱신
34. 2026-05-07 Adobe Target tntId(hex.28_0)·OffersRequest.tnt_id·응답 tntId 재사용
33. 2026-05-07 Adobe Target Delivery visitorId(thirdPartyId) 필수 반영·ApiException 400
32. 2026-05-07 Adobe Target URL 파싱 오류 400·502 상세·웹 pointerEvents LogBox
31. 2026-05-07 Adobe Target 설정 문자열 strip 및 설정 캐시 안내
30. 2026-05-07 docs/main 04 Adobe Target 연동 가이드 작성
29. 2026-05-07 Adobe Target 라우터 to_thread·웹 카드 boxShadow 분기
28. 2026-05-07 Adobe Target 설정 ASCII 검증 및 ConfigError 시 HTTP 400
27. 2026-05-07 Adobe Target 오퍼 프리로드 응답 로그 res.ok 분기
26. 2026-05-07 Adobe Target 프론트 API 베이스 URL을 api_url(8010)과 정합
25. 2026-05-07 Adobe Target 백엔드 의존성·Delivery API 모델 정합
24. 2026-05-06 Adobe Target Python SDK 백엔드·Expo 연동
23. 2026-05-06 Adobe RN SDK 제거 및 Python SDK 전환 준비
22. 2026-05-06 dev CORS에 Expo 웹 출처(8081) 추가
21. 2026-05-06 쿠폰 목록 recipient_id·테이블 가로 스크롤
20. 2026-05-06 git pull 및 손상 원격 ref 정리
19. 2026-04-28 CouponTable 페이징 반응형(밀도·줄바꿈)
18. 2026-04-28 docs/main 아키 변경 반영(env 분리·CORS 설정화)
17. 2026-04-28 env 프론트·백엔드 분리 및 설정 경로 전환
16. 2026-04-28 docs/main 01~03 고객용 문서 정비
15. 2026-04-28 CouponTable 페이지 직접 입력 점프(Enter/blur) 추가
14. 2026-04-28 쿠폰 keyset 페이징 전환·cursor CSV·맨뒤 최적화
13. 2026-04-28 coupons CSV API 추가·CouponTable 서버 다운로드 전환·맨앞/맨뒤 버튼
1. 2026-04-28 백엔드·CouponTable 점검 반영(reltuples 0 폴백·ORM NOT NULL·CSV BOM)
2. 2026-04-28 FastAPI 쿠폰 API·웹 CouponTable·deploy·gitignore
3. 2026-04-27 env 이미지 라벨 LGU·KT·SKT
4. 2026-04-27 README Windows venv pip 명령 정리
5. 2026-04-27 Python venv·requirements.txt·gitignore 문서화
6. 2026-04-27 환경별 config __DEV__ 분기·deploy.sh·README·REQUIREMENTS
7. 2026-04-27 GitHub main 초기 푸시 및 loadConfig dev/prd 분기
8. 2026-04-27 프로젝트 폴더 git init 및 GitHub origin 연결
9. 2026-04-27 갤러리 한 줄·번호 선택·기본 숨김 UI 수정
10. 2026-04-27 frontend 폴더로 Expo 앱 이전 (모노레포)
11. 2026-04-27 AT_TEST_PAGE Expo 풀 코드 구현 (PRD 정합)
12. 2026-04-27 docs/main AT_TEST_PAGE PRD v1.0 작성

## Log Body

55. 2026-05-08 Adobe `config.adobe.json` Git 제외·example 템플릿·프론트 postinstall

Purpose: 저장소에는 Adobe 자격·mbox 민감 설정을 올리지 않고 `config.adobe.example.json` 만 유지한다. 런타임 `config.adobe.json` 은 로컬·서버에서 생성한다.

Changes:

- `.gitignore`: `backend/env/config.adobe.json`, `frontend/env/config.adobe.json` 추가
- `backend/env/config.adobe.example.json`, `frontend/env/config.adobe.example.json` 추가(플레이스홀더)
- `frontend/scripts/ensureAdobeEnv.cjs`, `package.json` postinstall
- `target_config` 예외 메시지·문서 04 v2.6·코드 주석 정합

Changed files: .gitignore, backend/env/config.adobe.example.json, frontend/env/config.adobe.example.json, frontend/scripts/ensureAdobeEnv.cjs, frontend/package.json, backend/adobe_backend/target_backend/target_config.py, target_client.py, target_adobe_router.py, __init__.py, backend/app/config.py, frontend/utils/loadConfig.ts, docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md, docs/log/log.md

54. 2026-05-07 Adobe config.adobe.json 중첩(administration/mboxes) 로드 수정·프론트 mboxes 정규화

Purpose: `backend/env/config.adobe.json` 을 `administration`·`mboxes` 로 나눈 경우에도 SDK 자격·mbox 기본값이 채워지게 한다. 프론트 `frontend/env/config.adobe.json` 이 `mboxes` 만 가질 때 `config.adobe_target.*` 이 비지 않게 한다.

Changes:

- backend/adobe_backend/target_backend/target_config.py: `_str_admin_or_root`, `_str_mboxes_or_root`, `_int_timeout_ms` 및 `load_adobe_target_settings` 반영
- frontend/utils/loadConfig.ts: `normalizeAdobeTarget`
- docs/main/04 v2.5, docs/log

Changed files: backend/adobe_backend/target_backend/target_config.py, frontend/utils/loadConfig.ts, docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md, docs/log/log.md

53. 2026-05-07 Adobe 설정 경로 명시·프론트 BRIDGE 주석 통일(backend/env·frontend/env config.adobe.json)

Purpose: 로더·에러·로그에 `backend/env/config.adobe.json`·`frontend/env/config.adobe.json` 경로를 일관되게 박고, 앱 일반 파일(`app/`, `utils/loadConfig`, 브리지)에서 어도비 패키지·설정 주입 구간을 `[BRIDGE · Adobe]` 구분선으로 명확히 한다.

Changes:

- backend: `target_config._adobe_config_path` 주석·예외 메시지, `target_client`·`target_adobe_router` 경로 안내
- frontend: `loadConfig.ts`, `app/_layout.tsx`, `app/index.tsx`, 브리지 3종, `targetApp.tsx`, `targetImageCarousel.tsx` 주석 보강

Changed files: backend/adobe_backend/target_backend/target_config.py, target_client.py, target_adobe_router.py, frontend/utils/loadConfig.ts, frontend/app/_layout.tsx, frontend/app/index.tsx, frontend/components/ImageCarousel.tsx, frontend/context/AdobeTargetContext.tsx, frontend/utils/adobeTargetSession.ts, frontend/adobe_frontend/target_frontend/app/targetApp.tsx, frontend/adobe_frontend/target_frontend/components/targetImageCarousel.tsx, docs/log/log.md

52. 2026-05-07 app/config·main 어도비 BRIDGE 주석 보강(위치·구분선)

Purpose: `app/` 는 앱 코어로 두고, `adobe_backend` 패키지를 쓰는 임포트·필드·함수 호출·CORS·라우터 등록 구간에 [BRIDGE · Adobe] 구분선과 파일 경로·심볼·효과를 명시한다.

Changes:

- backend/app/config.py: 임포트 블록 전후 구분선, Settings.adobe_target 필드, load_adobe_target_settings() 호출 주석
- backend/app/main.py: 임포트·register_target_routes·POST CORS 주석, 모듈 설명 정리

Changed files: backend/app/config.py, backend/app/main.py, docs/log/log.md

51. 2026-05-07 Adobe config.adobe.json 을 backend/env·frontend/env 로 이동

Purpose: Adobe 공통 설정 파일을 프로젝트 루트가 아닌 각 `env` 폴더에 두어 `config.dev.json` / `config.prd.json` 과 같은 위치에서 관리한다.

Changes:

- backend: `config.adobe.json` → `backend/env/config.adobe.json`, `target_config._adobe_config_path` 및 관련 문서·에러 메시지 경로 갱신
- frontend: `config.adobe.json` → `frontend/env/config.adobe.json`, `loadConfig.ts` 임포트 및 주석 갱신
- docs/main/04 v2.4, docs/log

Changed files: backend/env/config.adobe.json (신규 위치), backend/adobe_backend/target_backend/target_config.py, target_client.py, target_adobe_router.py, target_backend/__init__.py, backend/app/config.py (삭제: backend/config.adobe.json), frontend/env/config.adobe.json (신규 위치), frontend/utils/loadConfig.ts (삭제: frontend/config.adobe.json), docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md, docs/log/log.md

50. 2026-05-07 Adobe Target 백·프 패키지 통합 및 config.adobe.json 분리

Purpose: Adobe Target 관련 백엔드·프론트 코드를 전용 패키지로 모으고, dev/prd와 무관한 Adobe 설정은 `config.adobe.json` 한 곳에서 관리한다. 기존 `@/context`·`@/components/ImageCarousel` 등 경로는 브리지 파일로 유지한다.

Changes:

- backend: `adobe_backend/target_backend/` 에 `target_adobe_router.py`, `target_client.py`, `target_config.py`, `target_main.py` 추가. `backend/config.adobe.json` 신설, `backend/env` 에서 `adobe_target` 제거. `app/main.py`·`app/config.py` 는 브리지 주석과 함께 패키지를 호출.
- frontend: `adobe_frontend/target_frontend/` 에 `app/targetApp.tsx`, `context/targetContext.tsx`, `utils/targetSession.ts`, `components/targetImageCarousel.tsx` 추가. `frontend/config.adobe.json` 신설, `frontend/env` 에서 `adobe_target` 제거. `loadConfig` 병합. `tsconfig` 에 `@adobe/*` 별칭. 레거시 `ImageCarousel`·`AdobeTargetContext`·`adobeTargetSession` 은 재노출 브리지.
- docs/main/04 v2.3, docs/log 갱신

Changed files: backend/adobe_backend/**, backend/config.adobe.json, backend/app/config.py, backend/app/main.py, backend/env/config.dev.json, backend/env/config.prd.json (삭제: backend/app/routers/target_adobe.py, backend/app/target_client_adobe.py), frontend/adobe_frontend/**, frontend/config.adobe.json, frontend/utils/loadConfig.ts, frontend/tsconfig.json, frontend/app/_layout.tsx, frontend/app/index.tsx, frontend/env/config.dev.json, frontend/env/config.prd.json, frontend/components/ImageCarousel.tsx, frontend/context/AdobeTargetContext.tsx, frontend/utils/adobeTargetSession.ts, docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md, docs/log/log.md

49. 2026-05-07 Adobe Target 백엔드 mbox 기본값 config 정합(offer_mbox_name·track_mbox_name·Pydantic Field)

Purpose: 프론트 `frontend/env` 의 `adobe_target.offer_mbox_name`·`track_mbox_name` 과 동일 키를 백엔드 `backend/env` 에 두고, API 요청 JSON 에서 `mbox_name` 을 생략할 때도 동일 기본값이 쓰이도록 한다. 라우터 Pydantic 모델의 하드코딩 기본값을 제거하고 `Field(default_factory=...)` 로 `get_settings().adobe_target` 을 참조한다.

Changes:

- backend/app/config.py: `AdobeTargetSettings` 에 `offer_mbox_name`·`track_mbox_name` 필드 추가. `load_app_config` 에서 `_adobe_target_str` 후 빈 문자열이면 각각 `target-global-mbox`·`click-tracking-mbox` 폴백.
- backend/env/config.dev.json, backend/env/config.prd.json: `adobe_target` 에 `offer_mbox_name`·`track_mbox_name` 추가(현행 프론트와 동일: target-local-mbox + click-tracking-mbox).
- backend/app/routers/target_adobe.py: `_default_offer_mbox_name_from_settings` / `_default_track_mbox_name_from_settings` 및 `OffersRequest`·`TrackRequest` 의 `mbox_name` 을 `Field(default_factory=...)` 로 변경. 모듈 docstring 보강.
- docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md: v2.2 — §4.1·§5.1·§7·§9·문서 이력 갱신.
- docs/log/log.md 업데이트

Changed files: backend/app/config.py, backend/env/config.dev.json, backend/env/config.prd.json, backend/app/routers/target_adobe.py, docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md, docs/log/log.md

48. 2026-05-07 Adobe Target 1차 리팩토링(04 v2.1 런타임·track 응답, 진단 parse_execute 분기)

Purpose: 실제 진단 로그 기준으로 런타임 6단계를 문서에 고정하고, `send_notifications` 응답에서 `execute` 가 비는 것이 정상임을 명시한다. `AT_DEBUG_DELIVERY` 출력에서 track 경로가 `execute is None` WARNING 으로 오해되지 않게 `_at_debug_log_response(..., parse_execute=False)` 분기로 정리한다.

Changes:

- docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md: §2.4 런타임 순서·§2.5 offers/track Delivery 형태·§5.5 진단 로그 분기·문서 이력 v2.1
- backend/app/routers/target_adobe.py: `_at_debug_log_response` 에 `parse_execute` 키워드 인자, `track_click` 에서 `False` 전달, 응답 첫 줄에 `edge_host`, 진단 주석·중복 import 정리
- docs/log/log.md 업데이트

Changed files: docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md, backend/app/routers/target_adobe.py, docs/log/log.md

47. 2026-05-07 docs/main 04 v2.0 Adobe Target 가이드 재작성·PRD 연관 문서(04) 행 추가

Purpose: 히스토리·로그 대응표·코드 배너 규칙 장문 등 운영 설명에 불필요한 부분을 줄이고, 01~03과 같이 번호·단락 중심으로 읽기 쉽게 정리한다. PRD 연관 문서 표에 04를 넣어 찾기 쉽게 한다.

Changes:

`04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md`: §0·§7(로그표)·§9(버전 누적) 제거, mermaid·설정·백엔드·프론트·HTTP·클릭 필드 용도·체크리스트·연관 문서로 재구성(v2.0)

`01_AT_TEST_PAGE_PRD.md`: §7 연관 문서에 04 한 줄, 변경 이력 1.3

Changed files: docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md, docs/main/01_AT_TEST_PAGE_PRD.md, docs/log/log.md

46. 2026-05-07 docs/main 04 v1.6 Delivery 클릭 알림 용도(6.3)·tokens 한계(6.4)·로그 40~45·코드 정합

Purpose: `AT_DEBUG_DELIVERY`·ApiClient CAUTION·프론트 `adobe_target` mbox 설정 등 누락된 구현을 04에 반영하고, Adobe에 클릭을 알릴 때의 요청/응답 필드 용도와 `tokens`/eventToken 이슈를 이식 문서에 포함한다.

Changes:

04: §2.2 OpenAPI 주의, §3.2 프론트 `adobe_target`, §4.2 진단 행, §5.3·5.5·5.6·§6.1 정합, §6.3~6.4 신설(클릭 알림 용도 표·tokens 개선안), §7 로그 40~45, §8 체크리스트 15~18, v1.6

Changed files: docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md, docs/log/log.md

45. 2026-05-07 Adobe Target mbox 이름 frontend/env config 로 분리(offer=target-local-mbox·track=click-tracking-mbox)

Purpose: 프론트의 mbox 이름 하드코딩을 사용자 룰 #2.3.4(상수·설정 분리) 에 맞춰 환경별 JSON 설정으로 옮긴다. offers 는 named mbox(`target-local-mbox`)로, track 은 현행 `click-tracking-mbox` 분리 유지(사용자 선택 split). 백엔드 라우터의 `_is_target_global_mbox` 분기가 이미 자동 라우팅하므로 백엔드 코드 변경은 없음(`target-global-mbox`만 pageLoad 로 강제, 그 외는 execute.mboxes 로 송신).

⚠ Adobe 어드민 선행 작업: `target-local-mbox` 이름의 location 에 Activity 를 매칭(Form-based)하고 Live 로 발행해야 응답 옵션이 채워진다. 어드민에 해당 mbox 가 없거나 Activity 가 Draft/Inactive 면 응답은 200 OK + `execute.mboxes count=0` 또는 `options_count=0` 으로 떨어진다(43/44번 진단 로그로 확인 가능).

Changes:

- frontend/env/config.dev.json, frontend/env/config.prd.json: `adobe_target` 블록 추가 — `offer_mbox_name`, `track_mbox_name` 두 키. dev/prd 모두 같은 값으로 시작하되 환경별 변경 여지 확보.
- frontend/utils/loadConfig.ts: `AdobeTargetConfig` 인터페이스 추가(BEGIN/END 배너), `AppConfig.adobe_target: AdobeTargetConfig` 필수 필드로 추가, 파일 docstring에 AT 키 안내 추가.
- frontend/app/_layout.tsx: offers fetch 의 `mbox_name` 을 `config.adobe_target.offer_mbox_name` 로 변경. BEGIN 배너 주석 갱신(글로벌→named mbox 전환 시 백엔드 자동 라우팅 명시).
- frontend/components/ImageCarousel.tsx: track fetch 의 `mbox_name` 을 `config.adobe_target.track_mbox_name` 로 변경. BEGIN 배너 주석 갱신.
- 백엔드 라우터/모델 변경 없음(현행 분기 그대로 동작).
- docs/log/log.md 업데이트

Changed files: frontend/env/config.dev.json, frontend/env/config.prd.json, frontend/utils/loadConfig.ts, frontend/app/_layout.tsx, frontend/components/ImageCarousel.tsx, docs/log/log.md

44. 2026-05-07 Adobe Target 진단 로그 보강(request 요약 1줄·response.to_dict() 분할 덤프·track 엔드포인트 동일 적용)

Purpose: named mbox 실험(`target-global-mbox` 외 임의 이름)·track 디버깅 시 한눈에 보이도록 진단 로그를 보강한다. 사용자 룰을 따라 ApiClient/Configuration 직접 인스턴스화는 일체 사용하지 않고(42번 함정 회피), `delivery_request.to_str()`/`resp_obj.to_dict()` 인스턴스 메서드만 사용한다.

배경 정리:
- `target-global-mbox` 만 Adobe 예약어이고 `execute.mboxes` 배열 입력 금지(36번 NoGlobalMbox 400). 임의의 named mbox 이름(`target-local-mbox`, `at-hero-mbox` 등)은 자유롭게 사용 가능하며, 어드민에서 그 이름의 mbox에 Activity가 매칭되어 있어야만 응답 옵션이 채워진다.
- 우리 라우터(`_get_offers_sync`)는 이미 `_is_target_global_mbox` 분기로 `pageLoad`/`mboxes` 자동 라우팅 중이므로, 프론트의 `mbox_name`만 바꿔 named mbox 실험 가능(코드 변경 0줄).

Changes:

- backend/app/routers/target_adobe.py:
  - `_at_debug_request_summary(delivery_request)` 추가 — 전송 모드(`pageLoad`/`mboxes`/`notifications`)·mbox 이름(s)·page_url·tntId/thirdPartyId·property_token을 한 줄로 추출
  - `_at_debug_log_chunked(label, kind, full_str)` 분할 출력 공용 헬퍼 도입(중복 제거)
  - `_at_debug_log_request` 시작에 요약 1줄 출력 후 `to_str()` 분할
  - `_at_debug_log_response` 끝에 `resp_obj.to_dict()` 전체 분할 출력 추가(meta·edge_host·client·trace 등 추가 단서 확보)
  - `_track_click_sync` 의 SDK 호출 직전·직후에도 `_at_debug_log_request("track_click", ...)` / `_at_debug_log_response("track_click", ...)` 호출 추가
  - 환경변수 토글(`AT_DEBUG_DELIVERY=1`) 동작 유지
- docs/log/log.md 업데이트

Changed files: backend/app/routers/target_adobe.py, docs/log/log.md

43. 2026-05-07 Adobe Target offers 빈 배열 진단 로그 재도입(요청 to_str 분할·응답 page_load.options/mboxes 풀이)

Purpose: `LocationParseError`가 사라진 뒤에도 `/api/target/offers` 응답의 `offers`가 빈 배열로 들어와, 요청·응답 본문을 코드 근거로 진단할 수 있게 토글 가능한 임시 로그를 다시 둔다. 단, 42번에서 잡았던 함정(`ApiClient()`/`Configuration()` 무인자 인스턴스화 → `TypeWithDefault._default` 잠김 → urllib3 호스트 파싱 실패)은 절대 재발하지 않게 ApiClient/Configuration 직접 사용 없이 인스턴스 메서드(`to_str()`)와 SDK가 돌려준 응답 객체의 속성 접근만 사용한다.

진단 포인트(우리 라우터 특성 반영):
- 우리는 `mbox_name == "target-global-mbox"` 일 때 `execute.pageLoad`(RequestDetails+url)로 보낸다(36번 NoGlobalMbox 회피). 따라서 응답 오퍼는 `response.execute.page_load.options` 에 실린다. `execute.mboxes` 가 비어 있는 것은 정상이며 그것만 보면 오진하기 쉽다.
- 글로벌 mbox 외 케이스에서는 `execute.mboxes[*].options` 에 실린다.
- 두 경우 모두 옵션이 0이면 (1) Activity 미활성, (2) Audience 미일치, (3) at.js property/Workspace 권한 분리, (4) 프리뷰 토큰 없음/만료, (5) `target-global-mbox` 가 활성화 mbox 가 아닌 환경 등 가능성이 있다.

Changes:

- backend/app/routers/target_adobe.py:
  - `_at_debug_log_request(label, delivery_request)` 추가 — `delivery_request.to_str()`을 3000자씩 분할 로깅(요청 mbox·params·visitorId·_property 등 한 번에 확인).
  - `_at_debug_log_response(label, sdk_response)` 추가 — `response.status`/`request_id`/`client`, `execute.page_load.options`(글로벌 mbox), `execute.mboxes[*].options`(그 외), `prefetch` 존재 여부를 풀어서 로깅. 옵션은 처음 3~5개 미리보기로 잘라 출력.
  - `_get_offers_sync` 의 SDK 호출 직전·직후 두 곳에 호출 추가. 환경변수 `AT_DEBUG_DELIVERY=1` 일 때만 출력(기본 OFF).
  - `logger`/`router` 정의를 디버그 헬퍼 위로 이동(가독성).
- 42번 CAUTION 주석 유지(인자 없는 ApiClient/Configuration 직접 인스턴스화 금지). 본 진단은 그 규칙을 준수.
- docs/log/log.md 업데이트

Changed files: backend/app/routers/target_adobe.py, docs/log/log.md

42. 2026-05-07 Adobe Target LocationParseError 원인(ApiClient TypeWithDefault 메타클래스) 진단 및 디버그 코드 제거

Purpose: 41번에서 추가한 디버그 코드(`_AtDebugApiClient().sanitize_for_serialization(...)`)가 도리어 `urllib3.exceptions.LocationParseError: Failed to parse: '.tt.omtrdc.net', label empty or too long` 를 유발한다는 사실을 정확히 파악해 제거한다. 디버그 출력 자체에서 `_property` → `"property"` JSON 키 매핑은 정상으로 확인되었으므로 진단 목적은 달성됐다.

원인(코드 근거):
- `delivery_api_client/configuration.py` 의 `Configuration` 은 메타클래스 `TypeWithDefault` 사용. `__call__` 이 `cls._default is None` 일 때만 kwargs로 인스턴스화하고, 이후 호출은 무조건 `copy.copy(cls._default)` 를 반환(=새 kwargs 무시).
- `Configuration.__init__` 의 디폴트 host 시그니처가 `host="https://.tt.omtrdc.net"`(빈 client 자리). 즉 인자 없이 `Configuration()`을 처음 만든 측이 잠긴다.
- 우리가 추가한 `_AtDebugApiClient()` 가 인자 없이 `ApiClient()` → `Configuration()` 을 호출 → 위 디폴트 host로 `cls._default` 가 잠김.
- 이후 SDK가 정상 host로 `Configuration(host="https://<client>.tt.omtrdc.net")` 을 호출해도 메타클래스가 kwargs를 무시 → host=`https://.tt.omtrdc.net` → urllib3 idna에서 첫 라벨 빈 호스트 거부.
- 디버그 추가 이전에는 Adobe API에서 정상적으로 400(`global mbox not allowed`/`visitorId required`)이 돌아왔다는 사실이 본 가설과 정합.

Changes:

- backend/app/routers/target_adobe.py: 41번에서 추가한 디버그 블록 전체 제거 — `_at_debug_log_delivery` 헬퍼·`_at_debug_enabled`·`_AT_DEBUG_ENV`·`_at_debug_os` import·`_at_debug_json` import·`_AtDebugApiClient` import 모두 삭제. `_get_offers_sync`/`_track_click_sync` 내 호출부 2곳 제거. 동일 함정 재발 방지용 CAUTION 주석 추가(인자 없는 `ApiClient()`/`Configuration()` 직접 인스턴스화 금지·직렬화 검증은 `delivery_request.to_dict()` 인스턴스 메서드 사용)
- docs/log/log.md 업데이트

Changed files: backend/app/routers/target_adobe.py, docs/log/log.md

41. 2026-05-07 Adobe Target DeliveryRequest.property 직렬화 검증용 디버그(AT_DEBUG_DELIVERY 토글)

Purpose: `DeliveryRequest(_property=ModelProperty(...))` 매핑 의심을 코드 근거로 검증할 수 있게 임시 디버그 로그를 추가한다. delivery_api_client 소스 검증 결과(attribute_map['_property']='property', api_client.sanitize_for_serialization 가 attribute_map[attr]을 JSON 키로 사용) `_property` 키워드는 정상 매핑이지만, `to_str()`은 to_dict()를 통해 raw attr 키(`_property`)를 노출하므로 오인 소지가 있다. 이를 분리해 보여주는 헬퍼를 둔다.

Changes:

- backend/app/routers/target_adobe.py: 임시 디버그 헬퍼 `_at_debug_log_delivery(label, delivery_request)` 추가. 환경변수 `AT_DEBUG_DELIVERY=1` 일 때만 출력. (1) `delivery_request._property` 값, (2) `to_str()`(raw attr keys), (3) `ApiClient().sanitize_for_serialization(...)` JSON(실제 POST body, `property` 키)을 함께 로깅. `_get_offers_sync` / `_track_click_sync` 의 SDK 호출 직전에 호출.
- 신규 import: `json`(별칭 `_at_debug_json`), `delivery_api_client.api_client.ApiClient`(별칭 `_AtDebugApiClient`), `os`(별칭 `_at_debug_os`, `noqa: E402`)
- 필요 시 환경변수 unset 또는 헬퍼/호출부 제거로 손쉽게 원복 가능
- docs/log/log.md 업데이트

Changed files: backend/app/routers/target_adobe.py, docs/log/log.md

40. 2026-05-07 Adobe Target autoPlay 미동작 수정(파서 lenient·진단 로그·MIN 가드 제거)

Purpose: 사용자가 Adobe Target 어드민에서 오퍼를 적용했지만 자동 재생이 동작하지 않는 이슈를 잡는다. 원인은 (1) parseAdobeTargetOffer가 `autoPlayMs`를 number 타입만 수용해 어드민에서 흔히 들어오는 문자열 숫자(`"3000"`)를 거름, (2) 컴포넌트에 `MIN_AUTO_PLAY_MS=500` 하한이 있어 짧은 주기를 무시함, (3) 자동 재생 등록·스킵 여부를 콘솔에서 확인할 수 없어 디버깅이 어려움 — 세 가지였다.

Changes:

- frontend/context/AdobeTargetContext.tsx: parseAdobeTargetOffer/_coerceOfferContent 강화 — _toPositiveNumber/_toNonEmptyString 헬퍼로 숫자/문자형 모두 수용, content가 이중 인코딩 JSON 문자열인 경우도 한 단계 더 안전 파싱
- frontend/components/ImageCarousel.tsx: autoPlay useEffect를 사용자 요청 시그니처(`if (!ms || ms <= 0) return; setInterval(() => { if (!isAnimating) goNext(); }, ms)`, deps: `[adobeOffer?.autoPlayMs, adobeOffer, isAnimating, goNext]`)로 교체. ref 스캐폴딩(`goNextRef`/`isAnimatingRef`)·`MIN_AUTO_PLAY_MS` 상수·`useRef` import 제거. 등록/스킵 시점 진단 console.log 추가
- docs/log/log.md 업데이트

Changed files: frontend/context/AdobeTargetContext.tsx, frontend/components/ImageCarousel.tsx, docs/log/log.md

39. 2026-05-07 Adobe Target 코드 시각 구분(전용/혼합 배너)·파일명 접두사 미적용 정책

Purpose: Adobe Target 관련 코드가 어디에 들어가 있는지 한눈에 보이도록 시각 표기 규칙을 통일한다. 사용자 요청의 `at_1_`/`at_2_` 접두사는 Expo Router(`_layout.tsx`/`index.tsx`)·uvicorn 엔트리(`main.py`)·env 로더(`config.{APP_ENV}.json`) 등 프레임워크/규약 때문에 적용 시 동작이 깨지므로, 접두사 변경 대신 코드 내 굵은 BEGIN/END 배너 + 전용 파일 상단 배너로 시각 구분을 대체한다.

Changes:

- 전용 파일 상단 배너 1줄 추가(파일 docstring 직후): backend/app/target_client_adobe.py, backend/app/routers/target_adobe.py, frontend/utils/adobeTargetSession.ts, frontend/context/AdobeTargetContext.tsx
- 혼합 파일 AT 블록을 ▼▼▼ ADOBE TARGET — BEGIN: <설명> ▼▼▼ / ▲▲▲ ADOBE TARGET — END: <설명> ▲▲▲ 배너로 감쌈: backend/app/main.py(라우터 import·router include·CORS POST 인라인 주석), backend/app/config.py(_adobe_target_str·AdobeTargetSettings·load_app_config AT 매핑·Settings.adobe_target 인라인 주석), frontend/app/_layout.tsx(imports·Provider·오퍼 fetch), frontend/app/index.tsx(Context import·useAdobeTargetOffer·ImageCarousel adobeOffer prop), frontend/components/ImageCarousel.tsx(imports·상수·prop·트래킹 fetch·autoPlay·버튼 라벨)
- 각 적용 파일 docstring에 "Adobe Target 관련 코드 블록은 ▼▼▼/▲▲▲ 배너로 명시한다" 안내 문구 추가
- docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md: 0절 신설(파일 분류·표기 규칙·현재 적용 현황·파일명 접두사 미적용 정책), 7절 대응표 39행, 9절 v1.5
- 파일명 접두사(at_1_/at_2_)는 적용하지 않음(Expo Router·uvicorn·env 로더 규약 보호)

Changed files: backend/app/main.py, backend/app/config.py, backend/app/target_client_adobe.py, backend/app/routers/target_adobe.py, frontend/app/_layout.tsx, frontend/app/index.tsx, frontend/components/ImageCarousel.tsx, frontend/utils/adobeTargetSession.ts, frontend/context/AdobeTargetContext.tsx, docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md, docs/log/log.md

38. 2026-05-07 Adobe Target 오퍼 Context·ImageCarousel adobeOffer prop·autoPlay

Purpose: `_layout`이 받아온 Adobe Target 오퍼를 React Context로 묶어 `app/index.tsx`가 읽고, `ImageCarousel`이 `adobeOffer` prop으로 버튼 라벨·자동 재생을 동적으로 적용하게 만든다. 응답 `offers[].content`(객체 또는 JSON 문자열)는 `parseAdobeTargetOffer`에서 안전 파싱한다.

Changes:

- frontend/context/AdobeTargetContext.tsx (신규): `AdobeTargetOffer`·`AdobeTargetProvider`·`useAdobeTargetOffer`·`useAdobeTargetSetOffer`·`parseAdobeTargetOffer` (offers[].content 객체/JSON 문자열 안전 파싱)
- frontend/app/_layout.tsx: `RootLayout`을 `AdobeTargetProvider`로 감싸고 `RootLayoutInner`에서 fetch — 성공 시 `parseAdobeTargetOffer` 결과를 `setAdobeTargetOffer`로 Context 저장, sessionStorage(tnt_id/visitor_third_party_id)는 기존 동작 유지
- frontend/app/index.tsx: `useAdobeTargetOffer()`로 오퍼 읽어 `<ImageCarousel adobeOffer={...} />` prop drilling 한 단계
- frontend/components/ImageCarousel.tsx: `adobeOffer?: AdobeTargetOffer | null` prop 추가, 버튼 라벨 `adobeOffer?.buttonText ?? "▶ 다음 이미지"`, `adobeOffer?.autoPlayMs >= 500`일 때 `setInterval`로 자동 재생(`isAnimatingRef` 가드·cleanup `clearInterval`·`goNextRef`로 최신 함수 호출)
- docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md: 다이어그램에 Context 노드 추가, 5.2~5.5절 매핑 신설/재번호, 7절 대응표 38행, 8절 체크리스트 13~15 추가, 9절 v1.4

Changed files: frontend/context/AdobeTargetContext.tsx, frontend/app/_layout.tsx, frontend/app/index.tsx, frontend/components/ImageCarousel.tsx, docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md, docs/log/log.md

37. 2026-05-07 docs/main 04 Adobe Target 가이드 v1.3(로그 31~36·코드 정합)

Purpose: visitor·tntId·pageLoad·ApiException·LocationParseError·config strip·adobeTargetSession·LogBox 등 추가 개발분을 `04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md`에 반영해 이식 문서와 현재 구현을 일치시킨다.

Changes:

04: §2.2 Delivery 예외·URL 파싱, §3.1 `_adobe_target_str`, §4.2 헬퍼·에러 매트릭스·`DeliveryRequest.id`, §4.3 캐시·strip, §5.1 키·페이로드 우선순위, §5.2 LogBox·page_url, §6.1 pageLoad/NoGlobalMbox, §7 로그 30~36 행, §8 체크리스트 9~12, 변경 이력 v1.3

Changed files: docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md, docs/log/log.md

36. 2026-05-07 Adobe Target 글로벌 mbox pageLoad 전환(NoGlobalMbox 400)

Purpose: Delivery API가 `execute.mboxes`에 `target-global-mbox`를 허용하지 않아 400이 나므로, 동일 이름 요청은 `execute.pageLoad`+`page_url`로 보내고 응답은 `page_load.options`와 `mboxes` 모두에서 오퍼를 수집한다.

Changes:

`target_adobe.py`: `OffersRequest.page_url`, `_is_target_global_mbox`, `_offers_from_execute_response`, `Address`·`RequestDetails` import

`_layout.tsx`: `page_url`에 `window.location.href` 전달

`04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md`: HTTP 계약·4.2절 보강

Changed files: backend/app/routers/target_adobe.py, frontend/app/_layout.tsx, docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md, docs/log/log.md

35. 2026-05-07 Adobe Target 검증: track·offers 방문자 정합(adobeTargetSession)·docs/main 04 갱신

Purpose: 전체 검토 시 `ImageCarousel` track이 sessionStorage의 `tnt_id`를 보내지 않아 오퍼와 다른 익명 방문자로 기록되던 문제를 제거하고, `docs/main/04` HTTP 계약·프론트 매핑을 현재 코드와 맞춘다.

Changes:

`adobeTargetSession.ts`: sessionStorage 키·`getAdobeTargetVisitorPayload` 신설

`_layout.tsx`·`ImageCarousel.tsx`: 공통 페이로드 사용

`04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md`: v1.1, 요청·응답·체크리스트 갱신

Changed files: frontend/utils/adobeTargetSession.ts, frontend/app/_layout.tsx, frontend/components/ImageCarousel.tsx, docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md, docs/log/log.md

34. 2026-05-07 Adobe Target tntId(hex.28_0)·OffersRequest.tnt_id·응답 tntId 재사용

Purpose: 조언대로 Python SDK는 visitorId를 자동 생성하지 않으며, 익명 호출에는 `{uuid.hex}.28_0` 형 `tntId`가 관례이다. `OffersRequest`·`TrackRequest`에 `tnt_id`를 추가하고, Delivery 응답의 `id.tntId`가 있으면 클라이언트에 돌려 다음 요청에 재사용한다. `VisitorId`는 `delivery_api_client.Model`만 사용한다.

Changes:

`target_adobe.py`: `_new_client_tnt_id`, `_build_delivery_visitor_id`, `_tnt_id_from_delivery_response`, offers/track 응답에 `tnt_id` 우선

`_layout.tsx`: sessionStorage `at_tnt_id` 우선 전달

Changed files: backend/app/routers/target_adobe.py, frontend/app/_layout.tsx, docs/log/log.md

33. 2026-05-07 Adobe Target Delivery visitorId(thirdPartyId) 필수 반영·ApiException 400

Purpose: Adobe Delivery API가 `visitorId`에 tntId·thirdPartyId·marketingCloudVisitorId 중 하나를 요구하는데, 기존에는 `customer_ids`만 전달되어 400이 났다. `DeliveryRequest.id`(VisitorId)에 thirdPartyId를 넣고, Adobe `ApiException` 400은 그대로 HTTP 400으로 돌린다.

Changes:

`target_adobe.py`: `_third_party_id_for_target`, offers/track에 `VisitorId(third_party_id=…)`, 응답에 `visitor_third_party_id`, `ApiException` 분기

`_layout.tsx`: sessionStorage에 `visitor_third_party_id` 저장 후 다음 프리로드에 `visitor_id`로 전달

Changed files: backend/app/routers/target_adobe.py, frontend/app/_layout.tsx, docs/log/log.md

32. 2026-05-07 Adobe Target URL 파싱 오류 400·502 상세·웹 pointerEvents LogBox

Purpose: urllib3 `LocationParseError`(비ASCII 호스트 등)가 502로만 보이던 문제를 400과 캐시 무효화로 완화하고, 기타 Target 실패 시 응답에 예외 유형·메시지를 담는다. Expo 웹에서 RN Web의 pointerEvents deprecation 경고를 LogBox로 숨긴다.

Changes:

`target_adobe.py`: `LocationParseError` 시 `get_settings`·`get_target_client` 캐시 clear 후 HTTP 400, 일반 예외 시 502 detail에 code·reason·message

`_layout.tsx`: 웹에서 `LogBox.ignoreLogs`로 pointerEvents deprecation 한 줄 무시

Changed files: backend/app/routers/target_adobe.py, frontend/app/_layout.tsx, docs/log/log.md

31. 2026-05-07 Adobe Target 설정 문자열 strip 및 설정 캐시 안내

Purpose: `adobe_target` JSON 값의 앞뒤 공백으로 인한 설정 오인식을 줄이고, `get_settings`가 `@lru_cache`이므로 `config.*.json` 수정 후에는 백엔드 재시작이 필요함을 코드 주석으로 남긴다.

Changes:

`config.py`: `_adobe_target_str`로 client·organization_id·property_token을 strip 후 `AdobeTargetSettings`에 반영, 모듈·함수 주석 정리

Changed files: backend/app/config.py, docs/log/log.md

30. 2026-05-07 docs/main 04 Adobe Target 연동 가이드 작성

Purpose: Adobe Target이 백엔드·프론트·env·의존성·외부 API에 어떻게 적용되었는지와 타 시스템 이식 절차를 한 문서로 정리한다.

Changes:

docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md: 아키텍처, 기술 스택, HTTP 계약, 파일·함수 매핑, log 22~29 대응표, 이식 체크리스트

Changed files: docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md, docs/log/log.md

29. 2026-05-07 Adobe Target 라우터 to_thread·웹 카드 boxShadow 분기

Purpose: 동기 Target SDK가 async 엔드포인트에서 이벤트 루프를 막을 수 있어 `asyncio.to_thread`로 오프로딩한다. RN Web `shadow*` 경고는 프로젝트 카드 스타일에서 웹만 `boxShadow`로 분기한다.

Changes:

`target_adobe.py`: `_get_offers_sync`·`_track_click_sync` + `await asyncio.to_thread(...)`

`CouponTable.tsx`·`ImageGallery.tsx`: `Platform.OS === "web"`일 때 `boxShadow`, 그 외 `shadow*`

Changed files: backend/app/routers/target_adobe.py, frontend/components/CouponTable.tsx, frontend/components/ImageGallery.tsx, docs/log/log.md

28. 2026-05-07 Adobe Target 설정 ASCII 검증 및 ConfigError 시 HTTP 400

Purpose: 한글 플레이스홀더가 `client`·`organization_id`에 있을 때 urllib3 `LocationParseError`로 502만 나오던 것을, SDK 호출 전에 막고 메시지로 원인을 드러낸다.

Changes:

`target_client_adobe.py`: `AdobeTargetConfigError`, `_assert_adobe_target_ascii`, `get_target_client`에서 호출

`target_adobe.py`: `AdobeTargetConfigError` 시 400·detail 문자열, 그 외는 기존 502

Changed files: backend/app/target_client_adobe.py, backend/app/routers/target_adobe.py, docs/log/log.md

27. 2026-05-07 Adobe Target 오퍼 프리로드 응답 로그 res.ok 분기

Purpose: 502 등 비정상 응답도 `res.json()` 후 `offers loaded`로 찍혀 혼동되는 문제를 제거한다.

Changes:

`_layout.tsx`: `fetch` 후 `res.ok`가 아니면 `console.warn`으로 상태 코드·본문 출력, 성공 시에만 `offers loaded` 로그

Changed files: frontend/app/_layout.tsx, docs/log/log.md

26. 2026-05-07 Adobe Target 프론트 API 베이스 URL을 api_url(8010)과 정합

Purpose: 웹 콘솔 `POST ...:8000/... net::ERR_CONNECTION_REFUSED`를 제거한다. Adobe 호출 기본값이 백엔드 포트와 불일치했음.

Changes:

`_layout.tsx`·`ImageCarousel.tsx`: `API_BASE_URL`을 `config.api_base_url ?? config.api_url ?? http://localhost:8010`으로 변경해 `frontend/env`의 `api_url`과 동일 백엔드를 사용

`loadConfig.ts`: 주석 보강

Changed files: frontend/app/_layout.tsx, frontend/components/ImageCarousel.tsx, frontend/utils/loadConfig.ts, docs/log/log.md

25. 2026-05-07 Adobe Target 백엔드 의존성·Delivery API 모델 정합

Purpose: uvicorn 기동 시 `delivery_api_client`·`target-python-sdk` 임포트 실패를 제거하고, 생성된 클라이언트의 `Property`/`property` 명명과 맞춘다.

Changes:

venv: `six`, `python-dateutil`, `urllib3`, `certifi`, `tzlocal`, `requests`, `tld`, `user-agents`, `json-logic` 설치; Python 3.13에서 `pkg_resources` 복구를 위해 `setuptools`를 69.x로 고정

`target_adobe.py`: `Property` 제거·`ModelProperty` 및 `DeliveryRequest(..., _property=...)`로 수정

`requirements.txt`: 위 전이 의존성 및 `target-python-sdk`, `setuptools<70` 명시

검증: `backend\.venv\Scripts\python.exe -c "import app.main"` 성공

Changed files: backend/app/routers/target_adobe.py, backend/requirements.txt, docs/log/log.md

24. 2026-05-06 Adobe Target Python SDK 백엔드·Expo 연동

Purpose: FastAPI 백엔드에 Adobe Target Python SDK 프록시 API를 추가하고, Expo 웹 프론트에서 오퍼 조회/클릭 트래킹을 백엔드 호출 방식으로 연결한다.

Changes:

backend: `target_client_adobe.py`(SDK 싱글톤)·`routers/target_adobe.py`(offers/track 엔드포인트) 신규 추가, `config.py` Adobe 설정 로드 확장, `main.py` 라우터 등록 및 CORS POST 허용

env: `backend/env/config.dev.json`, `backend/env/config.prd.json`에 `adobe_target` 블록 추가

frontend: `_layout.tsx` Launch 스크립트 제거 후 `/api/target/offers` 프리로드 호출로 교체, `ImageCarousel.tsx`의 다음 이미지 클릭 시 `/api/target/track` fire-and-forget 전송 추가, `loadConfig.ts`에 `api_base_url` 선택 필드 추가

infra: `pip install target-python-sdk` 설치 완료

검증: Python 3.13 환경에서 SDK import 시 `pkg_resources` 누락 오류가 남아 추가 의존성(`tld`, `user-agents`, `json-logic`, `setuptools`) 설치 후에도 완전 해소되지 않음을 확인

Changed files: backend/env/config.dev.json, backend/env/config.prd.json, backend/app/config.py, backend/app/main.py, backend/app/target_client_adobe.py, backend/app/routers/target_adobe.py, frontend/app/_layout.tsx, frontend/components/ImageCarousel.tsx, frontend/utils/loadConfig.ts, docs/log/log.md

23. 2026-05-06 Adobe RN SDK 제거 및 Python SDK 전환 준비

Purpose: 잘못 추가된 React Native Adobe 패키지를 제거하고, Python 기반 SDK(`target-python-sdk`) 설치 경로로 전환한다.

Changes:

frontend: `@adobe/react-native-aepcore`, `@adobe/react-native-aepedge`, `@adobe/react-native-aeptarget` 제거

검증: `npm ls @adobe/react-native-aepcore @adobe/react-native-aepedge @adobe/react-native-aeptarget` 결과 `(empty)` 확인

Changed files: frontend/package.json, frontend/package-lock.json, docs/log/log.md

22. 2026-05-06 dev CORS에 Expo 웹 출처(8081) 추가

Purpose: `expo start --web` 기본 출처(`http://localhost:8081`)에서 API 호출 시 CORS로 차단되던 문제를 `cors_origins`에 허용 목록을 추가해 해소한다.

Changes:

`backend/env/config.dev.json`: `http://localhost:8081`, `http://127.0.0.1:8081` 허용(기존 3010 유지)

Changed files: backend/env/config.dev.json, docs/log/log.md

21. 2026-05-06 쿠폰 목록 recipient_id·테이블 가로 스크롤

Purpose: 쿠폰 조회 테이블에 `recipient_id`를 노출하고, 페이징 영역은 그대로 두고 테이블 블록만 가로 스크롤해 한 줄 표시로 줄바꿈을 막는다.

Changes:

backend: base SELECT·`CouponRowOut`·CSV에 `recipient_id` 포함, 목록 직렬화 반영

frontend: `CouponTable`에 `recipient_id` 컬럼, `ScrollView` horizontal + 고정 열 너비·`nowrap`(웹)로 테이블만 스크롤

Changed files: backend/app/database.py, backend/app/schemas.py, backend/app/routers/coupons.py, frontend/components/CouponTable.tsx, docs/log/log.md

20. 2026-05-06 git pull 및 손상 원격 ref 정리

Purpose: 원격 WhatDoThis/AT_TEST_PAGE의 main을 로컬에 반영한다. pull 실패 원인이 된 잘못된 경로 `refs/remotes/origin - 복사본/main` 하위 디렉터리를 제거한 뒤 pull을 완료했다.

Changes:

.git: 손상·비표준 원격 추적 ref 디렉터리 제거 후 `git pull` 성공, `e318c4a..126f145` fast-forward

원격 반영: `.gitignore` 보강, `frontend/app/_layout.tsx` 변경

Changed files: .gitignore, frontend/app/_layout.tsx, docs/log/log.md

19. 2026-04-28 CouponTable 페이징 반응형(밀도·줄바꿈)

Purpose: 좁은 화면에서 맨앞·이전·다음·맨뒤 버튼이 과도하게 커 레이아웃이 깨지는 문제를 카드 너비 기준 밀도·flexWrap으로 완화한다.

Changes:

CouponTable: pagerDensity(comfortable|compact|tiny)로 패딩·폰트·입력칸 크기 조절, 좁을 때 flexWrap·중앙 정렬 및 페이지 입력 행 전폭 줄바꿈

Changed files: frontend/components/CouponTable.tsx, docs/log/log.md

18. 2026-04-28 docs/main 아키 변경 반영(env 분리·CORS 설정화)

Purpose: 아키텍처 변경 후 문서 불일치를 해소하기 위해 docs/main 01~03을 실제 코드·로그 기준으로 최신 상태로 맞춘다.

Changes:

docs/main 01: 설정 경로를 frontend/env·backend/env 분리 구조로 수정하고 cors_origins 항목을 PRD 설명에 추가

docs/main 02: 프론트 설정 파일 경로를 frontend/env로 교체하고 __DEV__ 기반 dev/prd 선택 규칙을 명시

docs/main 03: backend/env 디렉터리 및 config.prd.example 포함 구조 반영, APP_ENV 경로·주요 키(api_port, cors_origins)·CORS 정책 설명 보강

Changed files: docs/main/01_AT_TEST_PAGE_PRD.md, docs/main/02_AT_TEST_PAGE_FRONTEND_GUIDE.md, docs/main/03_AT_TEST_PAGE_BACKEND_GUIDE.md, docs/log/log.md

17. 2026-04-28 env 프론트·백엔드 분리 및 설정 경로 전환

Purpose: 프론트에 DB 민감정보가 포함되지 않도록 설정 파일을 frontend/env와 backend/env로 분리하고 배포 의존성을 단순화한다.

Changes:

frontend/env, backend/env 신규 생성 및 역할별 config.dev/prd 분리, backend/env/config.prd.example 추가

backend config 경로를 backend/env 기준으로 전환하고 CORS allow_origins를 설정 파일(cors_origins)에서 로드

deploy.sh의 env 복사 단계 제거, .gitignore를 backend/env/config.prd.json만 제외하도록 정리

루트 env/config.dev.json, env/config.prd.json, env/config.prd.example.json 삭제

Changed files: frontend/env/config.dev.json, frontend/env/config.prd.json, backend/env/config.dev.json, backend/env/config.prd.json, backend/env/config.prd.example.json, frontend/utils/loadConfig.ts, backend/app/config.py, backend/app/main.py, deploy.sh, .gitignore, docs/log/log.md

16. 2026-04-28 docs/main 01~03 고객용 문서 정비

Purpose: 레퍼런스 문서 형식과 현재 코드 기준을 반영해 docs/main 문서를 고객이 이해하기 쉬운 구조로 재정리한다.

Changes:

docs/main: 01_AT_TEST_PAGE_PRD를 v1.1 기준으로 업데이트하고 제품 요약·범위·수용 기준·연관 문서 체계를 정리

docs/main: 02_AT_TEST_PAGE_FRONTEND_GUIDE 신규 작성(화면 구조, 컴포넌트 책임, 설정 연동, 웹 쿠폰 테이블 동작)

docs/main: 03_AT_TEST_PAGE_BACKEND_GUIDE 신규 작성(API 파라미터, 페이징 방식, DB 연동, 에러 정책)

Changed files: docs/main/01_AT_TEST_PAGE_PRD.md, docs/main/02_AT_TEST_PAGE_FRONTEND_GUIDE.md, docs/main/03_AT_TEST_PAGE_BACKEND_GUIDE.md, docs/log/log.md

15. 2026-04-28 CouponTable 페이지 직접 입력 점프(Enter/blur) 추가

Purpose: 이전/다음은 keyset으로 유지하면서, 드물게 필요한 특정 페이지 점프를 OFFSET(page) 입력으로 지원한다.

Changes:

frontend: pageInfo 텍스트를 TextInput(숫자)로 교체하고 Enter/blur 시에만 유효성 검사 후 fetchPage(page) 호출

frontend: 입력 중에는 요청하지 않고, 범위(1~totalPages) 밖 값은 현재 페이지로 롤백

frontend: 페이지 입력 UI 스타일(너비 72px, 중앙정렬, 테두리) 추가

Changed files: frontend/components/CouponTable.tsx, docs/log/log.md

14. 2026-04-28 쿠폰 keyset 페이징 전환·cursor CSV·맨뒤 최적화

Purpose: 대용량(수천만 건)에서 OFFSET 비용을 줄이기 위해 이전/다음을 keyset 기반으로 전환하고, CSV도 동일 cursor 파라미터를 지원한다.

Changes:

backend: /api/coupons에 cursor_created/cursor_id/direction(next|prev|last) 추가, page 호환 유지, next_cursor/prev_cursor 응답 추가

backend: /api/coupons/csv도 page·cursor·last 공통 파라미터 지원, direction=last 시 ASC 조회 후 역정렬

database/schemas: 정렬키를 created DESC,id DESC로 강화하고 PaginationOut에 cursor 필드 추가

frontend: 이전/다음은 keyset 호출로 변경, 맨앞/맨뒤는 점프 호출 유지, CSV는 현재 조회 쿼리(downloadQuery) 그대로 서버 호출

README: keyset API 사용법 및 (created DESC, id DESC) 복합 인덱스 검토 가이드 추가

Changed files: backend/app/database.py, backend/app/schemas.py, backend/app/routers/coupons.py, backend/README.md, frontend/components/CouponTable.tsx, docs/log/log.md

13. 2026-04-28 coupons CSV API 추가·CouponTable 서버 다운로드 전환·맨앞/맨뒤 버튼

Purpose: CSV를 클라이언트 생성이 아닌 백엔드 다운로드 엔드포인트로 통일하고, 페이지 이동 UX를 보강한다.

Changes:

backend: /api/coupons/csv 추가(UTF-8 BOM + 헤더 + 이스케이프 + Content-Disposition 파일명)

frontend: CouponTable에서 buildCsv/downloadCsvWeb 제거, CSV 버튼을 서버 URL window.open 호출로 전환

frontend: 페이징에 맨앞/맨뒤 버튼 추가

Changed files: backend/app/routers/coupons.py, frontend/components/CouponTable.tsx, docs/log/log.md

1. 2026-04-28 백엔드·CouponTable 점검 반영(reltuples 0 폴백·ORM NOT NULL·CSV BOM)

Purpose: 서버 운영 시 reltuples=0 오판·ORM nullable 표기·CSV BOM 처리 등 점검 피드백을 반영한다.

Changes:

database: created/last_modified/coupon_date NOT NULL 매핑, _BASE_COUPON_SELECT 모듈 캐시

coupons: estimate>0일 때만 추정 사용·행 매핑 단순화

CouponTable: BOM을 Blob 생성 시점에 부착

Changed files: backend/app/database.py, backend/app/routers/coupons.py, frontend/components/CouponTable.tsx, docs/log/log.md

2. 2026-04-28 FastAPI 쿠폰 API·웹 CouponTable·deploy·gitignore

Purpose: PostgreSQL 대용량 쿠폰 테이블 조회 API(8010)·웹 전용 테이블·CSV(현재 페이지)·배포 스크립트를 추가한다.

Changes:

backend: FastAPI+async SQLAlchemy GET /api/coupons, pg_class 추정 total, 503 처리, README·requirements

env: api_url·api_port·db 블록 추가(prd 비밀번호는 서버에서만 설정)

frontend: CouponTable·index 배치, loadConfig api_port 선택 필드

deploy.sh: env→frontend 복사, 백엔드 venv pip, pm2 at-test-api(APP_ENV=prd)

.gitignore: env/config.prd.json, backend venv/__pycache__, frontend/env/

Changed files: backend/app/main.py, backend/app/config.py, backend/app/database.py, backend/app/schemas.py, backend/app/routers/coupons.py, backend/app/routers/__init__.py, backend/app/__init__.py, backend/requirements.txt, backend/README.md, env/config.dev.json, env/config.prd.json, frontend/app/index.tsx, frontend/components/CouponTable.tsx, frontend/utils/loadConfig.ts, deploy.sh, .gitignore, docs/log/log.md

3. 2026-04-27 env 이미지 라벨 LGU·KT·SKT

Purpose: 갤러리·설정 기반 라벨을 통신사명으로 표시한다.

Changes:

config.dev.json·config.prd.json images[].label을 LGU, KT, SKT로 변경

Changed files: env/config.dev.json, env/config.prd.json, docs/log/log.md

4. 2026-04-27 README Windows venv pip 명령 정리

Purpose: Windows venv에서 pip 자기 업그레이드 오류를 피하도록 python -m pip 안내를 문서에 반영한다.

Changes:

README venv 절차를 python -m pip로 통일, REQUIREMENTS에 한 줄 보강

Changed files: README.md, REQUIREMENTS.md, docs/log/log.md

5. 2026-04-27 Python venv·requirements.txt·gitignore 문서화

Purpose: 백엔드·스크립트용 Python 가상환경(venv) 사용을 위해 루트 requirements와 문서·gitignore를 맞춘다.

Changes:

.gitignore에 venv·.venv·__pycache__ 등 Python 관련 제외 추가

requirements.txt 신규(플레이스홀더), README·REQUIREMENTS에 venv 생성·활성화 절차 및 Python 버전 권장 추가

Changed files: .gitignore, requirements.txt, README.md, REQUIREMENTS.md, docs/log/log.md

6. 2026-04-27 환경별 config __DEV__ 분기·deploy.sh·README·REQUIREMENTS

Purpose: EXPO_PUBLIC 대신 __DEV__로 dev/prd JSON을 고르고, 리눅스 배포 스크립트와 루트 문서를 추가한다.

Changes:

loadConfig: __DEV__ ? devConfig : prdConfig, AppConfig.api_url 필수

deploy.sh: monorepo 기준 frontend에서 expo export 후 serve로 dist 서빙, APP_DIR/PORT 환경변수 지원

README.md, REQUIREMENTS.md 신규, env/config.prd.json 포맷 정리

Changed files: frontend/utils/loadConfig.ts, env/config.prd.json, deploy.sh, README.md, REQUIREMENTS.md, docs/log/log.md

7. 2026-04-27 GitHub main 초기 푸시 및 loadConfig dev/prd 분기

Purpose: 원격 WhatDoThis/AT_TEST_PAGE에 초기 커밋을 푸시하고, env의 dev/prd JSON을 앱에서 로드하도록 맞춘다.

Changes:

git add·commit·main 브랜치·origin push

loadConfig: config.json 제거에 맞춰 config.dev.json 기본, EXPO_PUBLIC_CONFIG_PROFILE=prd 시 config.prd.json, AppConfig에 api_url 선택 필드

Changed files: frontend/utils/loadConfig.ts, docs/log/log.md

8. 2026-04-27 프로젝트 폴더 git init 및 GitHub origin 연결

Purpose: 워크스페이스 루트에 독립 저장소를 두고 원격 WhatDoThis/AT_TEST_PAGE와 연결한다.

Changes:

Target_Test_Web_Android에 git init 수행, remote origin을 https://github.com/WhatDoThis/AT_TEST_PAGE.git 로 등록

Changed files: .git/ (신규), docs/log/log.md

9. 2026-04-27 갤러리 한 줄·번호 선택·기본 숨김 UI 수정

Purpose: 갤러리 줄바꿈 제거, 셀 전체 파란 배경 대신 번호만 선택 표시, 이미지 목록 기본 감춤.

Changes:

ImageGallery: 카드 padding 반영 innerWidth로 itemWidth 계산, flexWrap nowrap, 선택 스타일을 number에만 적용

app/index: galleryOpen 초기값 false

Changed files: frontend/components/ImageGallery.tsx, frontend/app/index.tsx, docs/log/log.md

10. 2026-04-27 frontend 폴더로 Expo 앱 이전 (모노레포)

Purpose: docs·env를 루트에 두고 프론트엔드(Expo) 구성요소를 frontend/로 이동해 이후 backend 추가가 가능한 구조로 만든다.

Changes:

app·components·assets·utils·Expo 설정·node_modules·dist·.expo를 frontend/로 이동, 루트에 스크립트 위임용 package.json 추가

loadConfig가 ../../env/config.json을 참조하도록 수정, Metro watchFolders로 모노레포 루트 감시, .gitignore 경로 갱신

Changed files: frontend/** (이동·신규 metro.config.js·수정 tsconfig/loadConfig), package.json(루트), .gitignore, docs/log/log.md

11. 2026-04-27 AT_TEST_PAGE Expo 풀 코드 구현 (PRD 정합)

Purpose: PRD 및 제공 계획서에 맞춰 Expo Router 단일 페이지 앱(캐러셀·갤러리·토글·config)을 워크스페이스 루트에 구현한다.

Changes:

Expo SDK 54 기반 package.json·babel·tsconfig·app.json 구성, app/_layout·index 및 components·utils·env 추가

갤러리 선택과 캐러셀 인덱스 동기화(PR FR-06), 기본 이미지 3종(Expo 에셋 복사), 웹 export(dist) 빌드 검증

Changed files: (이후 frontend/로 이전됨) package.json, package-lock.json, babel.config.js, tsconfig.json, app.json, expo-env.d.ts, .gitignore, env/config.json, utils/*, components/*, app/*, assets/images/*, docs/log/log.md

12. 2026-04-27 docs/main AT_TEST_PAGE PRD v1.0 작성

Purpose: 개발 계획서 v1.0을 바탕으로 제품 요구사항 명세서(PRD)를 완성해 docs/main에 반영한다.

Changes:

docs/main에 PRD v1.0 문서 추가(기술 스택, 아키텍처, config 명세, 화면·컴포넌트, FR/NFR, 수용 기준, 로드맵, 리스크)

Changed files: docs/main/01_AT_TEST_PAGE_PRD.md, docs/log/log.md
