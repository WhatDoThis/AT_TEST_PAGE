# Log

## Log Index

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
