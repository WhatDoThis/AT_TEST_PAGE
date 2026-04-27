#!/usr/bin/env bash
# AT_TEST_PAGE 웹 배포 스크립트 (리눅스 서버에서 실행)
# 저장소 클론 루트를 APP_DIR에 맞춘다. 예: /root/woo/at_test_page

set -euo pipefail

APP_NAME="at-test-page"
APP_DIR="${APP_DIR:-/root/woo/at_test_page}"
PORT="${PORT:-3010}"
FRONTEND_DIR="$APP_DIR/frontend"

echo "========================================="
echo " AT_TEST_PAGE 배포"
echo " APP_DIR=$APP_DIR"
echo " PORT=$PORT"
echo "========================================="

cd "$APP_DIR"

# 1. 소스 갱신 (필요 시 주석 해제)
# git pull origin main

# 2. 의존성 (루트 스크립트 + frontend)
npm install
npm install --prefix frontend

# 3. 웹 정적 빌드 (프로덕션 번들 → __DEV__ false → config.prd.json)
cd "$FRONTEND_DIR"
npx expo export --platform web

cd "$APP_DIR"

# 4. 기존 프로세스 종료
pm2 delete "$APP_NAME" 2>/dev/null || true

# 5. serve로 frontend/dist 정적 서빙
pm2 start npx --name "$APP_NAME" -- serve "$FRONTEND_DIR/dist" -l "$PORT" -s

pm2 status "$APP_NAME" || true

echo "========================================="
echo " 배포 완료"
echo " http://127.0.0.1:$PORT"
echo " https://ajo.sdev-ibank.co.kr/at-test (nginx 등에서 프록시 시)"
echo "========================================="
