#!/usr/bin/env bash
# AT_TEST_PAGE 웹·API 배포 스크립트 (리눅스 서버에서 실행)
# 저장소 클론 루트를 APP_DIR에 맞춘다. 예: /root/woo/at_test_page

set -euo pipefail

APP_NAME="at-test-page"
API_NAME="at-test-api"
APP_DIR="${APP_DIR:-/root/woo/at_test_page}"
PORT="${PORT:-3010}"
FRONTEND_DIR="$APP_DIR/frontend"
BACKEND_DIR="$APP_DIR/backend"

echo "========================================="
echo " AT_TEST_PAGE 배포"
echo " APP_DIR=$APP_DIR"
echo " PORT=$PORT"
echo "========================================="

cd "$APP_DIR"

# 1. 소스 갱신 (필요 시 주석 해제)
# git pull origin main

# 2. env → frontend/env 복사 (빌드 시 __DEV__ 분기용 JSON)
cp -r "$APP_DIR/env" "$FRONTEND_DIR/env"

# 3. 의존성 (루트 스크립트 + frontend)
npm install
npm install --prefix frontend

# 4. 웹 정적 빌드 (프로덕션 번들 → __DEV__ false → config.prd.json)
cd "$FRONTEND_DIR"
npx expo export --platform web

cd "$APP_DIR"

# 5. 프론트 pm2 재시작 (정적 서빙, 3010)
pm2 delete "$APP_NAME" 2>/dev/null || true
pm2 start npx --name "$APP_NAME" -- serve "$FRONTEND_DIR/dist" -l "$PORT" -s

# 6. 백엔드 venv 및 의존성
if [ ! -d "$BACKEND_DIR/venv" ]; then
  python3 -m venv "$BACKEND_DIR/venv"
fi
"$BACKEND_DIR/venv/bin/pip" install -r "$BACKEND_DIR/requirements.txt"

# 7. 백엔드 pm2 재시작 (APP_ENV=prd, 8010)
pm2 delete "$API_NAME" 2>/dev/null || true
pm2 start bash --name "$API_NAME" -- -lc "cd '$BACKEND_DIR' && exec env APP_ENV=prd ./venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8010"

pm2 status "$APP_NAME" || true
pm2 status "$API_NAME" || true

echo "========================================="
echo " 배포 완료"
echo " 프론트 http://127.0.0.1:$PORT"
echo " API    http://127.0.0.1:8010"
echo " https://ajo.sdev-ibank.co.kr/at-test (nginx 등에서 프록시 시)"
echo "========================================="
