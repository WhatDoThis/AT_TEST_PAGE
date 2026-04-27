# AT_TEST_PAGE 요구 사항 (Requirements)

개발·빌드·리눅스 웹 배포에 필요한 런타임과 도구를 정리한다.

## 개발 / 빌드

| 항목 | 권장 |
|------|------|
| OS | Windows 10+, macOS, Linux |
| Node.js | **20.x LTS** 이상 (Expo SDK 54와 호환되는 버전) |
| 패키지 매니저 | npm (또는 pnpm/yarn — `frontend/package-lock.json` 기준은 npm) |
| Git | 최신 안정판 |

설치 후 확인:

```bash
node -v
npm -v
```

## 프로젝트 의존성 설치

저장소 루트에서:

```bash
npm install
npm install --prefix frontend
```

## 리눅스 서버 (웹 정적 배포)

`deploy.sh`가 `npx expo export` 후 `serve`로 `frontend/dist`를 띄운다.

| 항목 | 설명 |
|------|------|
| OS | Linux (systemd/pm2 사용 환경) |
| Node.js | 개발과 동일 권장 (20.x LTS+) |
| pm2 | 프로세스 관리 (`npm install -g pm2`) |
| serve | 정적 파일 서빙 (`npm install -g serve`) |

최초 1회 전역 설치 예:

```bash
npm install -g serve pm2
```

## Android (선택)

- Android Studio / JDK
- Expo Go 또는 EAS Build 계정(별도 문서)

## Python (백엔드·스크립트, 선택)

| 항목 | 권장 |
|------|------|
| Python | **3.11** 또는 **3.12** (3.10+ LTS 계열) |
| 가상환경 | 표준 라이브러리 `venv` (`python -m venv venv`) |
| 의존성 파일 | 루트 `requirements.txt` |

가상환경은 Git에 올리지 않는다(`.gitignore`에 `venv/`, `.venv/` 등 등록됨).  
새 패키지 설치 후 배포·공유 시:

```bash
pip freeze > requirements.txt
```

(필요하면 `pip-tools` 등으로 고정 버전 관리)

## 관련 파일

- `env/config.dev.json` — 로컬·개발
- `env/config.prd.json` — export·릴리스 번들
- `frontend/utils/loadConfig.ts` — `__DEV__` 기준 로드
- `requirements.txt` — Python 패키지
