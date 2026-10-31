module.exports = {
  branches: ["main"],
  plugins: [
    [
      "@semantic-release/commit-analyzer",
      {
        preset: "conventionalCommits",
        // parserOpts: {
        //   noteKeywords: ["BREAKING CHANGE", "BREAKING CHANGES", "BREAKING"]
        // },
        releaseRules: [
          { type: "chore", scope: "deps", release: "patch" }
        ]
      }
    ],
    [
      "@semantic-release/release-notes-generator",
      {
        preset: "conventionalCommits",
        parserOpts: {
          noteKeywords: ["BREAKING CHANGE", "BREAKING CHANGES", "BREAKING"]
        },
        presetConfig: {
          types: [
            { type: "feat", section: "Features" },
            { type: "fix", section: "Bug Fixes" },
            { type: "perf", section: "Performance Improvements" },
            { type: "revert", section: "Reverts" },
            { type: "docs", section: "Documentation", hidden: false },
            { type: "style", section: "Styles", hidden: false },
            { type: "chore", section: "Dependency Updates", hidden: false },
            { type: "refactor", section: "Code Refactors", hidden: false },
            { type: "test", section: "Tests", hidden: false },
            { type: "build", section: "Build System", hidden: false },
            { type: "ci", section: "CI/CD", hidden: false },
            { type: "improvement", section: "Improvements", hidden: false }
          ]
        },
        writerOpts: {
          commitsSort: ["subject", "scope"]
        }
      }
    ],
    [
      "@semantic-release/npm",
      {
        npmPublish: false
      }
    ],
    [
      "@semantic-release/changelog",
      {
        changelogFile: "CHANGELOG.md"
      }
    ],
    ["@semantic-release/exec", {
      // Gate the release on lint and a clean build. The only build previously
      // ran inside publishCmd, i.e. after the version had been chosen and the
      // tag created, so a broken build produced a half-finished release.
      // webpack is called directly rather than via `npm run build` so this
      // check does not run sync-versions and rewrite version files before
      // semantic-release has decided the next version.
      "verifyConditionsCmd": "npm run lint && npx webpack --mode production",
      "publishCmd": "npm run archive ${nextRelease.version}"
    }],
    [
      "@semantic-release/github",
      {
        assets: [
          { 
            path: 'archive/firefoxPlugin.zip', 
            name: 'firefoxPlugin.${nextRelease.version}.zip',
            label: 'FireFox Plugin (${nextRelease.version})' 
          },
          { 
            path: 'archive/chromePlugin.zip', 
            name: 'chromePlugin.${nextRelease.version}.zip',
            label: 'Chrome Plugin (${nextRelease.version})' 
          }
          // [{path: 'dist/MyLibrary.js', name: 'MyLibrary-${nextRelease.gitTag}.js', label: 'MyLibrary JS (${nextRelease.gitTag}) distribution'}]
        ],
      },
    ],
    [
      "@semantic-release/git",
      {
        // scripts/syncVersions.ts writes the version into several files, but
        // only package.json was committed back. That is why src/manifest.json
        // shipped as 7.8.18 under tag v7.8.19, why package-lock.json was left
        // claiming 7.8.1, and why CHANGELOG.md stopped at 5.16.17 while
        // releases continued — the generated changelog was never committed.
        assets: [
          "package.json",
          "package-lock.json",
          "CHANGELOG.md",
          "website/package.json",
          "website/package-lock.json",
          "src/manifest.json",
          "src/plugin_page/inc/footer.html"
        ]
      }
    ]
  ]
};