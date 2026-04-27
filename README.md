# AT_TEST_PAGE

Expo(React Native + Expo Router) 기반 **웹 + Android** 단일 코드베이스. 설정은 저장소 루트 `env/`의 환경별 JSON으로 분리한다.

## 저장소 구조

| 경로 | 설명 |
|------|------|
| `frontend/` | Expo 앱 (`app/`, `components/`, `assets/`, `package.json`) |
| `env/config.dev.json` | 로컬·개발 번들용 설정 |
| `env/config.prd.json` | `expo export` 등 프로덕션 번들용 설정 |
| `docs/` | PRD·로그 등 문서 |
| `deploy.sh` | 리눅스 서버에서 웹 정적 배포용 스크립트 |
| `requirements.txt` | Python 패키지 목록 (백엔드·도구용) |
| `venv/` | 로컬 Python 가상환경 디렉터리(생성 후 사용, Git 제외) |

## Python 가상환경 (venv)

백엔드·자동화 스크립트용 Python을 쓸 때 저장소 **루트**에 가상환경을 둔다. 폴더명은 `venv`를 권장한다.

**Windows (PowerShell)**

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install -U pip
python -m pip install -r requirements.txt
```

(`pip install -U pip`만 쓰면 Windows venv에서 자기 업그레이드 오류가 날 수 있어 `python -m pip`을 권장한다.)

**macOS / Linux**

```bash
python3 -m venv venv
source venv/bin/activate
pip install -U pip
pip install -r requirements.txt
```

비활성화: `deactivate`  
자세한 Python 버전은 [REQUIREMENTS.md](./REQUIREMENTS.md)를 참고한다.

## 요구 사항

자세한 버전·배포 도구는 [REQUIREMENTS.md](./REQUIREMENTS.md)를 참고한다.

## 로컬 실행

```bash
npm install
npm install --prefix frontend
npm run web
```

## 설정 분기

- `frontend/utils/loadConfig.ts`에서 **`__DEV__`** 로 `config.dev.json` / `config.prd.json`을 고른다.
- `npx expo start` → 개발 모드 → **dev**
- `npx expo export --platform web` → 프로덕션 번들 → **prd**

## 웹 프로덕션 빌드

```bash
npm run export:web
```

산출물: `frontend/dist/`

## 리눅스 배포

1. 서버에 Node·npm, 전역 `pm2`, `serve` 설치: [REQUIREMENTS.md](./REQUIREMENTS.md)
2. 저장소를 `APP_DIR`(기본 예: `/root/woo/at_test_page`)에 클론
3. `deploy.sh`의 `APP_DIR`이 실제 경로와 일치하는지 확인 후 실행:

```bash
chmod +x deploy.sh
./deploy.sh
```

경로·포트를 바꿀 때는 환경변수로 덮어쓸 수 있다.

```bash
export APP_DIR=/opt/at_test_page
export PORT=3010
./deploy.sh
```

## 원격 저장소

https://github.com/WhatDoThis/AT_TEST_PAGE
