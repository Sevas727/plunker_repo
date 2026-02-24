# ADR-006: E2E Testing with Playwright

## Status

Accepted

## Date

2026-02-24

## Context

The project has unit and integration tests (Vitest + React Testing Library), but lacks end-to-end tests that verify the full user flows against a real browser and database. We need E2E tests to cover:

- Authentication flows (login, redirect, session management)
- Full CRUD operations for todos (create, read, update, delete)
- Search with debounce and URL synchronization
- Cross-page navigation

## Decision

### Test Runner: Playwright

Playwright was chosen for E2E testing:

| Criteria                 | Playwright                                | Cypress                         |
| ------------------------ | ----------------------------------------- | ------------------------------- |
| **Multi-browser**        | Chromium, Firefox, WebKit                 | Chromium-based only (free tier) |
| **Speed**                | Fast parallel, headless by default        | Slower, runs in browser process |
| **API**                  | Modern async/await                        | Custom chaining syntax          |
| **Auth handling**        | Built-in storageState                     | Manual cookie management        |
| **Next.js integration**  | `webServer` config auto-starts dev server | Requires separate process       |
| **Network interception** | Built-in route API                        | Built-in intercept              |

### Test Structure

```
e2e/
├── .auth/
│   ├── .gitkeep
│   └── user.json          # (gitignored) Saved session state
├── auth.setup.ts           # Login setup project — saves storageState
├── auth.spec.ts            # Authentication flow tests (6 tests)
├── todos-crud.spec.ts      # CRUD operations (7 tests, serial)
└── search-and-pagination.spec.ts  # Search + pagination (6 tests)
```

### Authentication Strategy

Playwright's `storageState` pattern is used for auth:

1. **Setup project** (`auth.setup.ts`): Logs in as `user@fedotov.dev`, saves cookies/localStorage to `e2e/.auth/user.json`
2. **Test projects** depend on setup, reuse the saved state — no re-login per test
3. **Unauthenticated tests** override with `test.use({ storageState: { cookies: [], origins: [] } })`

### Configuration Highlights

- **Single worker** (`workers: 1`) — tests run sequentially to avoid database race conditions
- **`webServer`** — Playwright auto-starts `pnpm dev` and waits for port 3000
- **`reuseExistingServer`** — reuses running dev server in local development
- **Screenshots on failure** — for debugging CI failures
- **Trace on first retry** — detailed trace for flaky test investigation

### Test Categories

| Spec file                       | Tests | What is covered                                                                                                                                               |
| ------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `auth.spec.ts`                  | 6     | Redirect unauthenticated, login page render, invalid credentials error, successful login + redirect, register page render, redirect authenticated from /login |
| `todos-crud.spec.ts`            | 7     | Dashboard cards, navigation, form validation, create todo, edit todo, delete todo (serial execution)                                                          |
| `search-and-pagination.spec.ts` | 6     | Search input + URL, filter by title, empty results, clearing search, reset page on search, case-insensitive                                                   |

Total: **19 E2E tests** (including 1 setup).

### Key Patterns

#### Desktop Table Locators

The todos page has both mobile cards (`md:hidden`) and a desktop table (`hidden md:table`). On Desktop Chrome viewport, the mobile elements are hidden. Locators target the visible desktop table:

```typescript
await expect(page.locator('table').getByText('Todo Title')).toBeVisible();
```

#### Serial CRUD Tests

The CRUD tests use `test.describe.configure({ mode: 'serial' })` with shared state (`uniqueTitle`) — create → edit → delete flow tests depend on each other.

#### Debounce Testing

Search tests verify URL updates after the 300ms debounce:

```typescript
await searchInput.fill('Deploy');
await expect(page).toHaveURL(/query=Deploy/, { timeout: 5_000 });
```

## Consequences

- Full user flow coverage from login through CRUD and search
- Tests run against real database (Neon PostgreSQL) — no mocks
- ~36 seconds total runtime (sequential, single worker)
- Auth state is cached — only one actual login per test run
- Tests are resilient to database state changes (don't depend on exact todo counts)
- `webServer` config enables zero-setup CI integration
