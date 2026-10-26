# Architectural Module Boundaries & Dependency Invariants

## 1. Principles of Architecture Isolation

To prevent code degradation, accidental coupling, and vendor lock-in, the monorepo enforces rigid module boundaries and unidirectional dependency rules.

The dependency graph is modelled as a **Directed Acyclic Graph (DAG)**.

---

## 2. Dependency Rules Matrix

| From (Source)             | Allowed Destinations        | Prohibited Destinations                           | Rationale                                                                           |
| :------------------------ | :-------------------------- | :------------------------------------------------ | :---------------------------------------------------------------------------------- |
| **`apps/*`**              | `packages/*`                | Other sibling `apps/*`                            | Applications are terminal nodes; packages must be modular and reusable.             |
| **`packages/*`**          | Other allowed `packages/*`  | Any `apps/*`                                      | Packages must never depend on consumer applications.                                |
| **`packages/contracts`**  | _None_ (pure TypeScript)    | `packages/ui`, `packages/validation`, React, apps | Pure domain layer; must remain 100% framework-independent and portable.             |
| **`packages/validation`** | `packages/contracts`        | `packages/ui`, `apps/*`, React                    | Validation asserts domain models; it does not render UI or depend on web layers.    |
| **`packages/config`**     | _None_                      | `apps/*`, `packages/ui`                           | Configuration resolution must remain application-independent.                       |
| **`packages/ui`**         | `packages/contracts`, React | `packages/validation`, product business logic     | Design system primitives must remain reusable across completely different products. |

---

## 3. Detailed Boundary Definitions

### Rule 1: Applications May Import Packages; Packages Must Never Import Applications

- **Permitted**: `apps/web/src/app/page.tsx` imports `{ Button } from '@tourism/ui'` and `{ Booking } from '@tourism/contracts'`.
- **Prohibited**: `packages/contracts/src/index.ts` importing anything from `apps/web`.

### Rule 2: Contracts Must Remain Framework-Independent

- The contracts package contains TypeScript interfaces, types, and abstract adapter definitions.
- It must not import `react`, `react-dom`, `@angular/core`, `next`, or DOM-specific objects (`HTMLElement`).

### Rule 3: Validation Depends on Contracts

- `@tourism/validation` consumes domain types defined in `@tourism/contracts` to provide strict runtime schema validation.
- It does not contain HTML rendering, React components, or HTTP server handlers.

### Rule 4: Generic UI Must Not Import Tourism Product Features

- `@tourism/ui` is an agnostic design system (Button, Card, Input, Modal, Badge).
- It must not contain booking forms, hotel checkout wizards, or travel-specific business logic.
- Domain-specific composite components belong in application-level component directories or dedicated feature packages.

### Rule 5: Server-Only Code Must Not Enter Client Bundles

- Code accessing database credentials, secret API keys, or private backend endpoints must be isolated in server-only modules or route handlers.
- Bundler tree-shaking and lint rules prevent leakage of server-only modules into browser client bundles.

### Rule 6: External Infrastructure Behind Explicit Interfaces

- External vendors (Stripe, Mapbox, Twilio) and internal service engines (ASP.NET Core, FastAPI) must only be referenced through abstract interfaces (`IPaymentProviderAdapter`, `IMappingProviderAdapter`, `ITransactionalPlatformClient`, `IIntelligenceServiceClient`).

### Rule 7: Circular Dependencies Are Strictly Prohibited

- Any circular reference (`A -> B -> A` or indirect `A -> B -> C -> A`) breaks module encapsulation, breaks tree-shaking, and causes unpredictable initialization orders.

---

## 4. Concrete Code Examples

### Allowed Patterns:

```typescript
// apps/web/src/app/page.tsx
import { DEFAULT_CONFIG } from "@tourism/config";
import type { Booking } from "@tourism/contracts";
import { validateBookingRequest } from "@tourism/validation";
import { Button, Card } from "@tourism/ui";
```

```typescript
// packages/validation/src/index.ts
import type { MonetaryAmount } from "@tourism/contracts";
```

### Prohibited Patterns:

```typescript
// VIOLATION: packages/contracts/src/index.ts
import React from "react"; // FORBIDDEN: UI code in pure contracts package
import { Button } from "@tourism/ui"; // FORBIDDEN: UI in contracts
import { webConfig } from "../../apps/web/config"; // FORBIDDEN: Package depends on app
```

```typescript
// VIOLATION: packages/ui/src/index.ts
import { validateBookingRequest } from "@tourism/validation"; // FORBIDDEN: Business validation in design primitives
```

---

## 5. Verification Mechanism

Dependency boundaries are verified through automated tooling:

1. **`pnpm graph:check` (`scripts/check-graph.mjs`)**:
   - Inspects `package.json` manifests for forbidden workspace dependencies.
   - AST/regex scans all TypeScript source files for illegal cross-package imports.
   - Runs depth-first cycle detection across all package vertices.
2. **`pnpm typecheck` (`turbo run typecheck`)**:
   - Ensures strict TypeScript compilation and path resolution across all packages.
3. **CI/CD Integration**:
   - Every pull request and release candidate runs the graph validator as a blocking check.
