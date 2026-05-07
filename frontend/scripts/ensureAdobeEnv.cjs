/**
 * ensureAdobeEnv.cjs (Adobe env 로컬 파일 보장)
 * ================================================================================
 * `npm install` 직후 `postinstall`에서 호출한다. `frontend/env/config.adobe.json` 이
 * 없을 때만 `config.adobe.example.json` 을 복사해 생성한다(기존 파일은 덮어쓰지 않음).
 *
 * [Main Functions]
 * ===========
 * - main: example → config.adobe.json 조건부 복사
 *
 * [Dependencies]
 * =========
 * - Node.js fs, path
 */

const fs = require("fs");
const path = require("path");

// 1. [복사] example 이 있고 대상이 없을 때만 복사한다.
function main() {
  const envDir = path.join(__dirname, "..", "env");
  const examplePath = path.join(envDir, "config.adobe.example.json");
  const targetPath = path.join(envDir, "config.adobe.json");

  if (fs.existsSync(targetPath)) {
    return;
  }
  if (!fs.existsSync(examplePath)) {
    console.warn(
      "[ensureAdobeEnv] skip: missing",
      path.relative(process.cwd(), examplePath)
    );
    return;
  }
  fs.copyFileSync(examplePath, targetPath);
  console.log(
    "[ensureAdobeEnv] created",
    path.relative(process.cwd(), targetPath),
    "from config.adobe.example.json (edit with real values)"
  );
}

main();
