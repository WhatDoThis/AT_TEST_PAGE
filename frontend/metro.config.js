/**
 * Metro 번들러 설정 (모노레포 루트의 env 참조)
 * ================================================================================
 * 프로젝트 루트의 env/config.json을 번들에 포함하기 위해 상위 디렉터리를 watchFolders에 넣는다.
 *
 * [Main Functions]
 * ===========
 * - getDefaultConfig 확장 및 watchFolders 설정
 *
 * [Dependencies]
 * =========
 * - expo/metro-config
 * - path (Node.js)
 */

const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "..");

// 1. 상위 env·문서 등을 감시해 JSON import가 해석되도록 한다.
const config = getDefaultConfig(projectRoot);

config.watchFolders = [monorepoRoot];

module.exports = config;
