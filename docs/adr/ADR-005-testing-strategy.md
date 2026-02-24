# ADR-005: Testing Strategy (Vitest + React Testing Library)

## Status

Accepted

## Date

2026-02-24

## Context

The project had zero automated tests. As part of the training roadmap, we need:

- Unit tests for utility functions and validation schemas
- Integration tests for server actions and data-access layer
- Component tests for React UI components
- A foundation for future E2E tests (Playwright)

We need to choose a test runner, configure it for Next.js App Router with TypeScript + JSX, and establish mocking patterns for server-side dependencies (database, auth, caching, navigation).

## Decision

### Test Runner: Vitest

Vitest was chosen over Jest for the following reasons:

| Criteria              | Vitest                                       | Jest                                        |
| --------------------- | -------------------------------------------- | ------------------------------------------- |
| **ESM support**       | Native, zero-config                          | Requires experimental flags or transformers |
| **TypeScript**        | Built-in via Vite transform                  | Needs `ts-jest` or SWC transformer          |
| **JSX**               | `@vitejs/plugin-react`                       | Needs Babel or SWC config                   |
| **Speed**             | Fast — reuses Vite's transform pipeline      | Slower cold starts                          |
| **API compatibility** | Jest-compatible (`describe`, `it`, `expect`) | —                                           |
| **Path aliases**      | Shares Vite `resolve.alias` config           | Needs `moduleNameMapper`                    |
| **Watch mode**        | HMR-powered, near-instant re-runs            | Full re-transform on change                 |

### Testing Library: React Testing Library

`@testing-library/react` + `@testing-library/user-event` + `@testing-library/jest-dom` for component tests. Tests focus on user-visible behavior rather than implementation details.

### Test Categories

| Category        | Directory                                              | Count    | What is tested                                      |
| --------------- | ------------------------------------------------------ | -------- | --------------------------------------------------- |
| **Unit**        | `__tests__/lib/`                                       | 3 files  | `utils.ts`, `schemas.ts`, `mdx.ts`                  |
| **Integration** | `__tests__/lib/data.test.ts`, `__tests__/lib/actions/` | 6 files  | Data queries, server actions (CRUD, auth, register) |
| **Component**   | `__tests__/ui/`                                        | 11 files | UI rendering, form behavior, URL updates            |

Total: **20 test files, 137 tests**.

### Mocking Strategy

#### Database (`postgres` tagged template)

The `sql` tagged template from `postgres` is mocked as a `vi.fn()` that returns a Promise. Each test controls return values via `mockResolvedValue` / `mockRejectedValue`.

```typescript
const mockSql = vi.fn();
vi.mock('@/app/lib/db', () => ({
  default: (...args: unknown[]) => mockSql(...args),
}));
```

#### Auth (`next-auth` + `@/auth`)

`next-auth` must be mocked before importing any module that transitively imports it, because `next-auth` internally imports `next/server` which does not exist in jsdom. The pattern uses `vi.mock()` hoisting + dynamic `await import()`:

```typescript
vi.mock('next-auth', () => ({
  AuthError: class AuthError extends Error {
    type = 'UnknownError';
  },
}));
const { createTodo } = await import('@/app/lib/actions');
```

#### Next.js modules

- `next/navigation` — mocked `useRouter`, `useSearchParams`, `usePathname`, `redirect`, `notFound`
- `next/cache` — mocked `revalidatePath`
- `next/link` — transparent `<a>` wrapper
- `next/image` — transparent `<img>` wrapper

#### React `useActionState`

For form component tests, `useActionState` is mocked via `vi.mock('react', async (importOriginal) => ...)` to control form state and capture the action function for direct invocation in tests.

### Schema Extraction

Zod schemas were extracted from `app/lib/actions.ts` into `app/lib/schemas.ts` to enable independent unit testing of validation logic without importing server-side dependencies.

## Configuration

### `vitest.config.ts`

- Plugin: `@vitejs/plugin-react` for JSX transform
- Environment: `jsdom`
- Setup file: `__tests__/setup.ts` (imports `@testing-library/jest-dom/vitest` matchers)
- Path alias: `@` → project root
- Test include: `__tests__/**/*.test.{ts,tsx}`

### Scripts

```json
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage"
```

## Alternatives Considered

| Option        | Pros                                         | Cons                                                    |
| ------------- | -------------------------------------------- | ------------------------------------------------------- |
| **Jest**      | Industry standard, huge ecosystem            | Poor ESM support, verbose config for Next.js App Router |
| **Vitest** ✅ | Native ESM/TS/JSX, fast, Jest-compatible API | Newer, smaller ecosystem                                |
| **Bun test**  | Extremely fast                               | Immature, limited React Testing Library support         |

## Consequences

- All 20 test files pass in ~3 seconds
- Mocking patterns are established and reusable for future tests
- Zod schemas are independently testable in `schemas.ts`
- `@testing-library/jest-dom` matchers available globally via setup file
- Foundation ready for Playwright E2E tests (separate config, separate runner)
