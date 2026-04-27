# Log

## Log Index

1. 2026-04-27 GitHub main 초기 푸시 및 loadConfig dev/prd 분기
2. 2026-04-27 프로젝트 폴더 git init 및 GitHub origin 연결
3. 2026-04-27 갤러리 한 줄·번호 선택·기본 숨김 UI 수정
4. 2026-04-27 frontend 폴더로 Expo 앱 이전 (모노레포)
5. 2026-04-27 AT_TEST_PAGE Expo 풀 코드 구현 (PRD 정합)
6. 2026-04-27 docs/main AT_TEST_PAGE PRD v1.0 작성

## Log Body

1. 2026-04-27 GitHub main 초기 푸시 및 loadConfig dev/prd 분기

Purpose: 원격 WhatDoThis/AT_TEST_PAGE에 초기 커밋을 푸시하고, env의 dev/prd JSON을 앱에서 로드하도록 맞춘다.

Changes:

git add·commit·main 브랜치·origin push

loadConfig: config.json 제거에 맞춰 config.dev.json 기본, EXPO_PUBLIC_CONFIG_PROFILE=prd 시 config.prd.json, AppConfig에 api_url 선택 필드

Changed files: frontend/utils/loadConfig.ts, docs/log/log.md

2. 2026-04-27 프로젝트 폴더 git init 및 GitHub origin 연결

Purpose: 워크스페이스 루트에 독립 저장소를 두고 원격 WhatDoThis/AT_TEST_PAGE와 연결한다.

Changes:

Target_Test_Web_Android에 git init 수행, remote origin을 https://github.com/WhatDoThis/AT_TEST_PAGE.git 로 등록

Changed files: .git/ (신규), docs/log/log.md

3. 2026-04-27 갤러리 한 줄·번호 선택·기본 숨김 UI 수정

Purpose: 갤러리 줄바꿈 제거, 셀 전체 파란 배경 대신 번호만 선택 표시, 이미지 목록 기본 감춤.

Changes:

ImageGallery: 카드 padding 반영 innerWidth로 itemWidth 계산, flexWrap nowrap, 선택 스타일을 number에만 적용

app/index: galleryOpen 초기값 false

Changed files: frontend/components/ImageGallery.tsx, frontend/app/index.tsx, docs/log/log.md

4. 2026-04-27 frontend 폴더로 Expo 앱 이전 (모노레포)

Purpose: docs·env를 루트에 두고 프론트엔드(Expo) 구성요소를 frontend/로 이동해 이후 backend 추가가 가능한 구조로 만든다.

Changes:

app·components·assets·utils·Expo 설정·node_modules·dist·.expo를 frontend/로 이동, 루트에 스크립트 위임용 package.json 추가

loadConfig가 ../../env/config.json을 참조하도록 수정, Metro watchFolders로 모노레포 루트 감시, .gitignore 경로 갱신

Changed files: frontend/** (이동·신규 metro.config.js·수정 tsconfig/loadConfig), package.json(루트), .gitignore, docs/log/log.md

5. 2026-04-27 AT_TEST_PAGE Expo 풀 코드 구현 (PRD 정합)

Purpose: PRD 및 제공 계획서에 맞춰 Expo Router 단일 페이지 앱(캐러셀·갤러리·토글·config)을 워크스페이스 루트에 구현한다.

Changes:

Expo SDK 54 기반 package.json·babel·tsconfig·app.json 구성, app/_layout·index 및 components·utils·env 추가

갤러리 선택과 캐러셀 인덱스 동기화(PR FR-06), 기본 이미지 3종(Expo 에셋 복사), 웹 export(dist) 빌드 검증

Changed files: (이후 frontend/로 이전됨) package.json, package-lock.json, babel.config.js, tsconfig.json, app.json, expo-env.d.ts, .gitignore, env/config.json, utils/*, components/*, app/*, assets/images/*, docs/log/log.md

6. 2026-04-27 docs/main AT_TEST_PAGE PRD v1.0 작성

Purpose: 개발 계획서 v1.0을 바탕으로 제품 요구사항 명세서(PRD)를 완성해 docs/main에 반영한다.

Changes:

docs/main에 PRD v1.0 문서 추가(기술 스택, 아키텍처, config 명세, 화면·컴포넌트, FR/NFR, 수용 기준, 로드맵, 리스크)

Changed files: docs/main/01_AT_TEST_PAGE_PRD.md, docs/log/log.md
