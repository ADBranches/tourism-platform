# Engineering Standards & Operational Guidelines

## 1. TypeScript Strictness Baseline

All packages and applications within the monorepo must adhere to strict TypeScript settings defined in `tsconfig.base.json`:

- `strict: true`: Enables all strict type-checking options (`noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`, `strictBindCallApply`, `strictPropertyInitialization`, `noImplicitThis`, `alwaysStrict`).
- `noUncheckedIndexedAccess: true`: Forces index lookups on arrays and objects to include `undefined` in their union type.
- `exactOptionalPropertyTypes: true`: Distinguishes between omitted optional keys and keys explicitly assigned `undefined`.
- `forceConsistentCasingInFileNames: true`: Enforces casing consistency across Linux and macOS/Windows file systems.
- `noImplicitOverride: true`: Requires explicit `override` keyword when overriding base class methods.
- `noEmit: true`: Relies on modern bundlers (Next.js/esbuild/Vite) for code generation while TSC strictly validates types.
- **Rule on `any`**: `any` is strictly prohibited unless an external, untyped legacy boundary makes it completely unavoidable. If unavoidable, isolate it with an immediate type assertion or user-defined type guard.

---

## 2. Naming Conventions

- **Directories & Folders**: `kebab-case` (e.g., `guided-tours`, `system-context`).
- **Source Files (Code/Modules)**:
  - React Components: `PascalCase.tsx` (e.g., `BookingSummaryCard.tsx`) or `page.tsx` / `layout.tsx` for Next.js routes.
  - Utilities and Pure Logic: `kebab-case.ts` (e.g., `date-utils.ts`, `geo-calculations.ts`).
  - Unit Tests: `<filename>.test.ts` or `<filename>.spec.tsx`.
- **TypeScript Identifiers**:
  - Types and Interfaces: `PascalCase` (e.g., `MonetaryAmount`, `BookingStatus`). Interface names for adapters must be prefixed with `I` (e.g., `IPaymentProviderAdapter`).
  - Functions & Variables: `camelCase` (e.g., `calculateTotalAmount`, `activeReservations`).
  - Constants & Enums: `UPPER_SNAKE_CASE` (e.g., `DEFAULT_PAGE_SIZE`, `SUPPORTED_LOCALES`).

---

## 3. Directory & Module Organisation

```text
packages/<pkg-name>/
  ├── src/
  │   ├── index.ts           # Primary package entry point (barrel file)
  │   └── ...modules
  ├── package.json           # Package manifest
  └── tsconfig.json          # Extends root tsconfig.base.json
```

---

## 4. Server Component vs. Client Component Boundaries

In Next.js App Router applications:

- **Default to React Server Components (RSC)**: Fetch data, render static HTML, and execute sensitive queries on the server.
- **Client Components (`'use client'`)**: Only use when browser-specific APIs, React state (`useState`, `useReducer`), event listeners, or client interactivity are strictly required.
- **Push Client Boundaries Down**: Keep client components at the leaves of the render tree. Never wrap an entire page in `'use client'` merely to handle one interactive button.

---

## 5. Component Size & Clean Architecture Expectations

- **Single Responsibility Principle**: Each component must do one thing well.
- **File Length Guidance**: Target <200 lines per component file. Decompose complex forms into step components and custom hooks.
- **Separation of Presentation & Business Logic**: Complex calculations belong in pure utility functions in packages, not embedded within JSX templates.

---

## 6. Accessibility (a11y) & Responsive Design

- **WCAG 2.1 AA Compliance**: All user interfaces must provide appropriate color contrast, keyboard navigation, and semantic HTML tags.
- **ARIA Attributes**: Use native semantic HTML elements (`<nav>`, `<main>`, `<button>`, `<dialog>`) before applying custom ARIA roles.
- **Mobile-First Responsive Layouts**: Design mobile layouts first using standard breakpoints (`sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`).
- **Touch Targets**: Minimum interactive tap target of 44x44 CSS pixels.

---

## 7. Testing Expectations

- **Unit Testing (Vitest)**: Mandatory for all contract validation, price calculators, date formatters, and pure business logic. Target >85% branch coverage on validation logic.
- **Component Testing**: Test interaction states, accessible labels, and error states.
- **End-to-End Testing (Playwright)**: Full browser verification of critical paths: Search -> Listing Details -> Booking Request -> Checkout -> Confirmation.

---

## 8. Error Handling, Logging & Observability

- **Never Swallow Errors**: Avoid empty `catch {}` blocks.
- **Structured Error Responses**: Always return structured errors with machine-readable codes and user-safe messages.
- **Observability**: Log operations with contextual metadata (traceId, actorId, durationMs). Never log passwords, tokens, or credit card numbers.

---

## 9. Environment Variables & Secret Management

- Keep `.env.example` in version control with all required keys and descriptive comments.
- Never commit actual `.env` files.
- Access client-side environment variables exclusively with appropriate prefixes (`NEXT_PUBLIC_` or `VITE_`).

---

## 10. Dependency Management

- Never add external dependencies without validating package maintenance, bundle weight, and security audit.
- Do not mix package managers. Use `pnpm` exclusively across the workspace.

---

## 11. Git Branching & Commit Conventions

- **Branches**:
  - `main`: Production-ready release branch.
  - `develop/sprint-XX-description`: Active sprint integration branch.
  - `feature/<ticket-or-scope>`: Feature branch targeting sprint develop branch.
- **Conventional Commits**:
  - `feat(<scope>): <description>`
  - `fix(<scope>): <description>`
  - `chore(<scope>): <description>`
  - `docs(<scope>): <description>`
  - `refactor(<scope>): <description>`

---

## 12. Engineering Loops & Methodologies

### The Continuous Engineering Loop:

```text
inspect -> model -> build -> test -> observe -> refine -> integrate -> commit -> push -> verify
```

1. **Inspect**: Examine real environment, files, and running processes before editing.
2. **Model**: Establish formal schemas, contracts, and boundary definitions.
3. **Build**: Write clean, pristine, strictly-typed implementation blocks.
4. **Test**: Execute unit tests, type checking, and boundary validators.
5. **Observe**: Review test logs, compiler output, and process outputs.
6. **Refine**: Correct failures at the root cause.
7. **Integrate**: Connect modules through defined contracts.
8. **Commit**: Create atomic commits conforming to conventional commits.
9. **Push**: Transmit verified commits to the authoritative remote.
10. **Verify**: Validate remote state and sha confirmation.

### Graph Engineering:

Treat the repository as a Directed Acyclic Graph (DAG) of packages, tasks, configurations, and external contracts. Ensure no cycles, enforce import directionality, and maintain modular independence.

---

## 13. Definition of Done (DoD)

A sprint phase or feature is marked complete if and only if:

1. All planned files exist with production-ready, typed implementations (no mock placeholders).
2. TypeScript compiles with 0 errors under strict mode (`pnpm typecheck`).
3. Linter passes with 0 warnings or errors (`pnpm lint`).
4. Automated tests pass (`pnpm test`).
5. Workspace structure validator passes (`pnpm validate:workspace`).
6. Architecture graph validator passes (`pnpm graph:check`).
7. Secret scanner confirms 0 leaked credentials.
8. Work is committed and pushed with confirmed commit hash.
