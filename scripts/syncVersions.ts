import fs from 'fs';
import path from 'path';

const rootPackageJson = require('../package.json');
const websitePackageJsonPath = path.join(__dirname, '../website/package.json');
const manifestJsonPath = path.join(__dirname, '../src/manifest.json');
const pluginPageHtmlPath = path.join(__dirname, '../src/plugin_page/inc/footer.html');

// if version number passed then use that version number
if (process.argv.length > 2) {
  rootPackageJson.version = process.argv[2];
  console.log(`Using version number passed as argument ${rootPackageJson.version}`);
}

const version: string = rootPackageJson.version;

/**
 * npm and semantic-release both require three-part semver. A four-part string
 * such as `7.8.19.0` is accepted by a browser manifest but makes
 * package.json invalid, which breaks `npm install` and the release pipeline.
 * Fail loudly here rather than writing a bad version into five files.
 */
const SEMVER = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z-.]+)?(?:\+[0-9A-Za-z-.]+)?$/;

if (!SEMVER.test(version)) {
  console.error(`Refusing to sync: "${version}" is not a valid semver version (expected MAJOR.MINOR.PATCH).`);
  process.exit(1);
}

/**
 * A browser manifest `version` must be one to four dot-separated integers,
 * so a semver prerelease such as `7.8.20-rc.1` is not valid there. Use the
 * numeric core for the manifest and keep the full string for npm packages.
 */
const manifestVersion = version.replace(/[-+].*$/, '');

const updateVersion = (filePath: string, newVersion: string) => {
  const fileContent = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  fileContent.version = newVersion;
  fs.writeFileSync(filePath, `${JSON.stringify(fileContent, null, 2)}\n`, 'utf8');
  console.log(`  ${path.relative(process.cwd(), filePath)} -> ${newVersion}`);
};

const updateHtmlVersion = (filePath: string, newVersion: string) => {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const pattern = /<span id="version-number">Version: [^<]+<\/span>/;

  // Previously a non-matching file was a silent no-op, so version drift went
  // unnoticed. Treat a missing marker as an error.
  if (!pattern.test(fileContent)) {
    console.error(`Refusing to sync: no <span id="version-number"> marker in ${filePath}`);
    process.exit(1);
  }

  const updated = fileContent.replace(pattern, `<span id="version-number">Version: ${newVersion}</span>`);
  fs.writeFileSync(filePath, updated, 'utf8');
  console.log(`  ${path.relative(process.cwd(), filePath)} -> ${newVersion}`);
};

console.log(`Synchronising version ${version}`);

updateVersion(websitePackageJsonPath, version);
updateVersion(manifestJsonPath, manifestVersion);
updateHtmlVersion(pluginPageHtmlPath, version);

// Deliberately NOT synced:
//   src/common/reference.tsx  (defaultJson.version)
//   src/preferences/index.html (the example config block)
// Both hold the *stored-config schema* version (currently 5.5.5.1), which
// upgradeManagement() in src/plugin_page/scripts/upgrades.tsx uses to decide
// whether a migration is needed. It is intentionally independent of the
// release version. The two writers that used to target them never matched
// anything, so they were silent no-ops; stamping the release version in
// would have made the migration gate meaningless.

console.log(`Synchronized version to ${version}`);
