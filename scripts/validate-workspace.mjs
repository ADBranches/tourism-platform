#!/usr/bin/env node
/**
 * Workspace Structure & Configuration Validator
 * Validates the presence and integrity of all Phase 1 files, configurations, and strictness flags.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

console.log(
  "--- Validating Workspace Structure & Configuration Baseline ---\n",
);

let failureCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
  } else {
    console.error(`[FAIL] ${message}`);
    failureCount++;
  }
}

// 1. Verify Required Directories
const requiredDirs = [
  "apps/web",
  "packages/contracts",
  "packages/validation",
  "packages/config",
  "packages/ui",
  "scripts",
  "docs/architecture",
  "docs/engineering",
  "docs/verification",
  "deploy",
];

for (const dir of requiredDirs) {
  assert(fs.existsSync(path.join(rootDir, dir)), `Directory exists: ${dir}`);
}

// 2. Verify Required Root Files
const requiredFiles = [
  "package.json",
  "pnpm-workspace.yaml",
  "turbo.json",
  "tsconfig.base.json",
  ".editorconfig",
  ".gitignore",
  "README.md",
  "docs/architecture/system-context.md",
  "docs/architecture/module-boundaries.md",
  "docs/engineering/standards.md",
];

for (const file of requiredFiles) {
  assert(
    fs.existsSync(path.join(rootDir, file)),
    `Required file exists: ${file}`,
  );
}

// 3. Validate package.json
try {
  const pkgJson = JSON.parse(
    fs.readFileSync(path.join(rootDir, "package.json"), "utf8"),
  );
  assert(pkgJson.private === true, "Root package.json is private");
  assert(
    typeof pkgJson.packageManager === "string" &&
      pkgJson.packageManager.startsWith("pnpm@"),
    "packageManager declares pnpm",
  );

  const requiredScripts = [
    "dev",
    "build",
    "lint",
    "typecheck",
    "test",
    "format",
    "format:check",
    "graph:check",
    "validate:workspace",
  ];

  for (const script of requiredScripts) {
    assert(
      Boolean(pkgJson.scripts?.[script]),
      `Root package.json defines script "${script}"`,
    );
  }
} catch (err) {
  assert(false, `Root package.json is valid JSON: ${err.message}`);
}

// 4. Validate turbo.json
try {
  const turboJson = JSON.parse(
    fs.readFileSync(path.join(rootDir, "turbo.json"), "utf8"),
  );
  const tasks = turboJson.tasks || turboJson.pipeline || {};
  const requiredTasks = [
    "dev",
    "build",
    "lint",
    "typecheck",
    "test",
    "format:check",
    "graph:check",
    "validate:workspace",
  ];
  for (const task of requiredTasks) {
    assert(Boolean(tasks[task]), `turbo.json declares task "${task}"`);
  }
} catch (err) {
  assert(false, `turbo.json is valid JSON: ${err.message}`);
}

// 5. Validate Strict TypeScript Configuration
try {
  const tsConfigBase = JSON.parse(
    fs.readFileSync(path.join(rootDir, "tsconfig.base.json"), "utf8"),
  );
  const opts = tsConfigBase.compilerOptions || {};
  assert(opts.strict === true, "tsconfig.base.json has strict: true");
  assert(
    opts.noUncheckedIndexedAccess === true,
    "tsconfig.base.json has noUncheckedIndexedAccess: true",
  );
  assert(
    opts.exactOptionalPropertyTypes === true,
    "tsconfig.base.json has exactOptionalPropertyTypes: true",
  );
  assert(
    opts.forceConsistentCasingInFileNames === true,
    "tsconfig.base.json has forceConsistentCasingInFileNames: true",
  );
  assert(
    opts.noImplicitOverride === true,
    "tsconfig.base.json has noImplicitOverride: true",
  );
  assert(
    opts.isolatedModules === true,
    "tsconfig.base.json has isolatedModules: true",
  );
  assert(opts.noEmit === true, "tsconfig.base.json has noEmit: true");
} catch (err) {
  assert(false, `tsconfig.base.json is valid JSON: ${err.message}`);
}

// 6. Validate Workspace Packages
const workspacePackages = [
  "apps/web",
  "packages/contracts",
  "packages/validation",
  "packages/config",
  "packages/ui",
];

for (const pkg of workspacePackages) {
  const manifestPath = path.join(rootDir, pkg, "package.json");
  const tsconfigPath = path.join(rootDir, pkg, "tsconfig.json");
  assert(fs.existsSync(manifestPath), `${pkg} has package.json`);
  assert(fs.existsSync(tsconfigPath), `${pkg} has tsconfig.json`);
  try {
    const pkgData = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    assert(
      Boolean(pkgData.name),
      `${pkg} declares package name (${pkgData.name})`,
    );
  } catch (err) {
    assert(false, `${pkg}/package.json is valid JSON`);
  }
}

// 7. Secret Scan Verification
const secretPatterns = [
  /AIza[0-9A-Za-z-_]{35}/, // Google API key
  /ghp_[0-9A-Za-z]{36}/, // GitHub token
  /sk-[a-zA-Z0-9]{32,}/, // OpenAI key
  /AKIA[0-9A-Z]{16}/, // AWS access key
];

let foundSecret = false;
function checkSecrets(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (
        entry.name !== "node_modules" &&
        entry.name !== ".git" &&
        entry.name !== ".next"
      ) {
        checkSecrets(fullPath);
      }
    } else if (
      /\.(ts|tsx|js|mjs|json|md|yaml|yml|env\.example)$/.test(entry.name)
    ) {
      const content = fs.readFileSync(fullPath, "utf8");
      for (const pattern of secretPatterns) {
        if (pattern.test(content)) {
          console.error(`[SECRET FOUND] Pattern matched in ${fullPath}`);
          foundSecret = true;
        }
      }
    }
  }
}
checkSecrets(rootDir);
assert(!foundSecret, "Secret scan completed with zero secrets detected");

console.log("\n--- Workspace Validation Summary ---");
if (failureCount > 0) {
  console.error(`FAILED: ${failureCount} check(s) failed.`);
  process.exit(1);
} else {
  console.log(
    "PASSED: All workspace baseline structural checks passed successfully.",
  );
  process.exit(0);
}
