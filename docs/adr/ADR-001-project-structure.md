# ADR-001: Project Structure and Routing

## Status

Accepted (updated 2026-02-24: removed `/dashboard` prefix, flattened routes)

## Date

2026-02-24

## Context

The application is being restructured from a Next.js invoice dashboard tutorial into a personal portfolio site with an authenticated todo management demo. We need to define the routing architecture that supports:

1. Public portfolio pages accessible without authentication
2. Protected todo CRUD pages requiring authentication
3. A global navigation bar that adapts based on auth state

## Decision

### Route Architecture

We adopt a two-zone architecture within a single Next.js App Router application:

**Public Zone** (no authentication required):

- `/` — Home page: "About Me" section + project cards
- `/projects/[slug]` — Individual project page rendered from MDX
- `/contacts` — Contact information
- `/login` — Sign in
- `/register` — Sign up

**Protected Zone** (authentication required):

- `/todos` — Todo list with statistics cards, search, pagination, and user filter
- `/todos/create` — Create todo form
- `/todos/[id]/edit` — Edit todo form

### Global Navbar

A single `Navbar` component rendered in the root `app/layout.tsx`:

- **Unauthenticated**: Home | Contacts | Login | Register
- **Authenticated**: Home | Contacts | Todos | User info | Logout

### Layout Hierarchy

```
app/layout.tsx          → Global: Navbar + {children}
  ├── page.tsx          → Home (public)
  ├── contacts/         → Contacts (public)
  ├── projects/[slug]/  → Project (public)
  ├── login/            → Login (public)
  ├── register/         → Register (public)
  └── todos/layout.tsx  → Container with padding (protected)
        ├── page.tsx    → Stats cards + todo list
        ├── create/     → Create form
        └── [id]/edit/  → Edit form
```

## Consequences

- The root layout handles the global navbar, eliminating the need for separate navigation on public vs protected pages
- No sidebar — the global navbar provides all navigation, keeping UI consistent across the app
- Todo pages use a simple layout with padding, no additional chrome
- MDX content lives outside `app/` in a `content/` directory, read at build/request time
- Auth state check in navbar is done server-side via `auth()` — no client-side flash
- Middleware protects all `/todos/*` routes via `auth.config.ts`
