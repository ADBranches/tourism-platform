#!/usr/bin/env node
/**
 * Dependency Graph and Architecture Boundary Validator
 * Validates module boundaries, import directions, and detects cycles across the monorepo.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const workspaceDirs = [
  { name: "@tourism/web", dir: path.join(rootDir, "apps/web"), type: "app" },
  {
    name: "@tourism/contracts",
    dir: path.join(rootDir, "packages/contracts"),
    type: "package",
  },
  {
    name: "@tourism/validation",
    dir: path.join(rootDir, "packages/validation"),
    type: "package",
  },
  {
    name: "@tourism/config",
    dir: path.join(rootDir, "packages/config"),
    type: "package",
  },
  {
    name: "@tourism/ui",
    dir: path.join(rootDir, "packages/ui"),
    type: "package",
  },
];

console.log(
  "--- Checking Architecture Dependency Graph & Module Boundaries ---\n",
);

let violationsCount = 0;

function reportViolation(rule, message) {
  console.error(`[VIOLATION] [${rule}] ${message}`);
  violationsCount++;
}

// 1. Check Package Manifest Dependencies
const dependencyGraph = new Map();

for (const pkg of workspaceDirs) {
  const pkgJsonPath = path.join(pkg.dir, "package.json");
  if (!fs.existsSync(pkgJsonPath)) {
    reportViolation("MANIFEST_MISSING", `Missing package.json in ${pkg.dir}`);
    continue;
  }

  const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));
  const deps = Object.keys(pkgJson.dependencies || {});
  const devDeps = Object.keys(pkgJson.devDependencies || {});
  const allWorkspaceDeps = [...deps, ...devDeps].filter((d) =>
    d.startsWith("@tourism/"),
  );

  dependencyGraph.set(pkg.name, allWorkspaceDeps);

  // Rule: Packages must never import or depend on apps
  if (pkg.type === "package") {
    for (const dep of allWorkspaceDeps) {
      if (dep === "@tourism/web") {
        reportViolation(
          "PACKAGE_DEPENDS_ON_APP",
          `Package ${pkg.name} must never depend on app ${dep}`,
        );
      }
    }
  }

  // Rule: Contracts must never depend on UI or rendering code
  if (pkg.name === "@tourism/contracts") {
    const prohibitedInContracts = ["react", "react-dom", "@tourism/ui"];
    for (const d of [...deps, ...devDeps]) {
      if (prohibitedInContracts.includes(d)) {
        reportViolation(
          "CONTRACTS_RENDERING_DEP",
          `@tourism/contracts must not depend on ${d}`,
        );
      }
    }
  }

  // Rule: Shared config must never depend on apps
  if (pkg.name === "@tourism/config") {
    for (const d of allWorkspaceDeps) {
      if (d === "@tourism/web") {
        reportViolation(
          "CONFIG_DEPENDS_ON_APP",
          `@tourism/config must not depend on application`,
        );
      }
    }
  }

  // Rule: Generic UI must not depend on validation or product features
  if (pkg.name === "@tourism/ui") {
    if (deps.includes("@tourism/validation")) {
      reportViolation(
        "UI_DEPENDS_ON_VALIDATION",
        `@tourism/ui must not depend on validation`,
      );
    }
  }
}

// 2. Scan Source Code Files for Prohibited Import Statements
function scanSourceFiles(dir, callback) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (
        entry.name !== "node_modules" &&
        entry.name !== ".next" &&
        entry.name !== "dist"
      ) {
        scanSourceFiles(fullPath, callback);
      }
    } else if (/\.(ts|tsx|js|mjs)$/.test(entry.name)) {
      callback(fullPath);
    }
  }
}

for (const pkg of workspaceDirs) {
  const srcDir = path.join(pkg.dir, "src");
  scanSourceFiles(srcDir, (filePath) => {
    const content = fs.readFileSync(filePath, "utf8");

    // Rule: Packages must never import apps
    if (
      pkg.type === "package" &&
      (content.includes("@tourism/web") || content.includes("/apps/web"))
    ) {
      reportViolation(
        "IMPORT_APP_IN_PACKAGE",
        `${filePath} imports from application @tourism/web`,
      );
    }

    // Rule: Contracts must never import UI or React
    if (pkg.name === "@tourism/contracts") {
      if (/from\s+['"](react|react-dom|@tourism\/ui)['"]/.test(content)) {
        reportViolation(
          "CONTRACT_IMPORTS_UI",
          `${filePath} in @tourism/contracts imports UI or React code`,
        );
      }
    }

    // Rule: Generic UI must never import product domain features
    if (pkg.name === "@tourism/ui") {
      if (/from\s+['"]@tourism\/validation['"]/.test(content)) {
        reportViolation(
          "UI_IMPORTS_DOMAIN",
          `${filePath} in @tourism/ui imports domain validation code`,
        );
      }
    }
  });
}

// 3. Cycle Detection in Dependency Graph
function detectCycle(graph) {
  const visited = new Set();
  const recStack = new Set();
  const path = [];

  function dfs(node) {
    visited.add(node);
    recStack.add(node);
    path.push(node);

    const neighbors = graph.get(node) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor)) return true;
      } else if (recStack.has(neighbor)) {
        path.push(neighbor);
        reportViolation(
          "CIRCULAR_DEPENDENCY",
          `Detected dependency cycle: ${path.join(" -> ")}`,
        );
        return true;
      }
    }

    recStack.delete(node);
    path.pop();
    return false;
  }

  for (const node of graph.keys()) {
    if (!visited.has(node)) {
      if (dfs(node)) return true;
    }
  }
  return false;
}

detectCycle(dependencyGraph);

// Print Graph Summary
console.log("Graph Nodes & Outgoing Dependencies:");
for (const [node, edges] of dependencyGraph.entries()) {
  console.log(`  ${node} -> [${edges.join(", ") || "none"}]`);
}
console.log("");

if (violationsCount > 0) {
  console.error(
    `FAILED: ${violationsCount} architectural boundary violation(s) detected.`,
  );
  process.exit(1);
} else {
  console.log(
    "PASSED: Dependency graph is acyclic and all module boundaries are respected.",
  );
  process.exit(0);
}
