# Global Tourism Platform

Enterprise-grade monorepo foundation for the end-to-end tourism platform, architected to connect travellers, local tourism suppliers, guides, drivers, support agents, and regional tourism authorities.

---

## 1. Product Purpose & End-to-End Direction

The Global Tourism Platform provides a unified, reliable digital ecosystem for discovery, booking, operational dispatch, and regional compliance across tourism services (accommodations, guided tours, local transport, cultural experiences, and activities).

The platform architecture is designed to scale across multiple client interfaces and specialized backend domains:

- **Web Frontend**: High-performance, SEO-optimized web application for travellers and suppliers.
- **Transactional Platform (Future)**: High-throughput, ACID-compliant booking and payment settlement engine built with ASP.NET Core and C#.
- **Intelligence Platform (Future)**: Search, personalized recommendations, dynamic itinerary generation, and automated compliance checking powered by Python, FastAPI, PostGIS, and pgvector.
- **Mobile Applications (Future)**: Real-time driver/guide dispatch and mobile traveller companion built with React Native.

---

## 2. Selected Technology Architecture

Phase 1 establishes the monorepo and client foundation with provider-neutral standards:

- **Monorepo Engine**: [Turborepo](https://turbo.build/) with [pnpm workspaces](https://pnpm.io/workspaces)
- **Web Application**: [Next.js](https://nextjs.org/) (App Router), React 19, TypeScript
- **Type Safety**: TypeScript 5.7+ in strict mode (`strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`)
- **Linting & Code Quality**: ESLint and Prettier
- **Testing**: Vitest for unit/integration testing and Playwright for end-to-end testing
- **Deployment & Containers**: Docker and Docker Compose for provider-neutral local and cloud execution

---

## 3. Monorepo Structure

```text
├── apps/
│   └── web/                   # Next.js App Router web application (@tourism/web)
├── packages/
│   ├── contracts/             # Pure domain models, interfaces, and service contracts (@tourism/contracts)
│   ├── validation/            # Strict runtime validators and schema assertions (@tourism/validation)
│   ├── config/                # Environment schemas, constants, and feature flags (@tourism/config)
│   └── ui/                    # Accessible, generic, design-system UI primitives (@tourism/ui)
├── scripts/
│   ├── check-graph.mjs        # Architecture boundary and dependency cycle validator
│   └── validate-workspace.mjs # Workspace structure, manifest, and secret scanner
├── docs/
│   ├── architecture/
│   │   ├── system-context.md   # System context, actors, trust boundaries, and service evolution
│   │   └── module-boundaries.md# Architectural dependency rules and graph invariants
│   ├── engineering/
│   │   └── standards.md        # Engineering standards, strictness guidelines, and loop method
│   └── verification/
│       └── phase-01-checklist.md # Phase 1 verification evidence checklist
├── deploy/
│   ├── docker-compose.yml     # Provider-neutral containerized orchestration
│   └── README.md              # Infrastructure and deployment documentation
├── pnpm-workspace.yaml        # Workspace package topology
├── turbo.json                 # Turborepo task pipeline configuration
├── tsconfig.base.json         # Shared strict TypeScript compiler configuration
└── package.json               # Root workspace manifest with unified scripts
```

---

## 4. Workspace Prerequisites

- **Node.js**: `v20.x` or `v22.x` (LTS recommended)
- **pnpm**: `v9.x` or `v10.x` (`corepack enable` recommended)
- **Git**: `v2.40+`

---

## 5. Local Setup

Clone the repository and install workspace dependencies:

```bash
# Enable pnpm via corepack if not globally installed
corepack enable

# Install all workspace dependencies
pnpm install

# Copy environment example
cp .env.example .env
```

---

## 6. Principal Commands

| Command                   | Purpose                                                                |
| :------------------------ | :--------------------------------------------------------------------- |
| `pnpm dev`                | Starts development servers across apps and watch mode                  |
| `pnpm build`              | Compiles packages and builds production application bundles            |
| `pnpm lint`               | Runs ESLint across all workspace packages and apps                     |
| `pnpm typecheck`          | Executes TypeScript type checking in strict mode across the workspace  |
| `pnpm test`               | Runs unit and integration test suites using Vitest                     |
| `pnpm format`             | Formats all code files using Prettier                                  |
| `pnpm format:check`       | Verifies code formatting conformance without modifying files           |
| `pnpm graph:check`        | Validates module boundary rules and detects circular dependencies      |
| `pnpm validate:workspace` | Validates workspace manifests, strictness flags, and scans for secrets |

---

## 7. Architectural Boundaries

All workspace code must adhere strictly to these boundary rules:

1. **Apps may import packages**: `apps/web` imports `@tourism/contracts`, `@tourism/validation`, `@tourism/config`, and `@tourism/ui`.
2. **Packages must never import apps**: Packages remain autonomous and reusable across multiple applications (web, future mobile, future edge workers).
3. **Contracts are framework-free**: `@tourism/contracts` must never import React, DOM, or UI libraries.
4. **Generic UI is domain-free**: `@tourism/ui` contains design-system primitives and must never import business validation or product entities.
5. **Shared config is application-independent**: `@tourism/config` provides pure configuration resolution without depending on web bundles.
6. **No circular dependencies**: The dependency graph must remain a strict Directed Acyclic Graph (DAG).
7. **External services behind adapters**: Payment, notifications, mapping, and future transactional/AI services interact through provider-neutral interfaces.

---

## 8. Git & Branching Strategy

- **Default Branch**: `main` (production-ready code only)
- **Development Branch**: `develop/sprint-01-foundation` (active Sprint 1 foundation)
- **Commit Format**: Conventional Commits (e.g., `chore: establish repository and architecture baseline`, `feat(contracts): add listing schema`)
- **Push Policy**: All workspace validations (`validate:workspace`, `graph:check`, `typecheck`, `lint`) must pass prior to committing and pushing.

---

## 9. Security Expectations

- **Zero Secret Ingestion**: Never commit `.env` files, API keys, credentials, or private certificates.
- **Input Validation**: All external inputs must be validated at runtime via `@tourism/validation`.
- **Provider Neutrality**: No vendor locks or proprietary SDK couplings in domain contracts.

---

## 10. Sprint 1 Phase 1 Status

- **Status**: **Phase 01 Complete** (Repository & Architecture Baseline established).
- **Scope Implemented**: Monorepo workspaces, Turborepo tasks, strict TypeScript baseline, architecture documentation, validation scripts, and initial contracts/validation/config/ui packages.
- **Next Phase (Phase 02)**: Contracts expansion, core domain typing, and test suite initialization.
