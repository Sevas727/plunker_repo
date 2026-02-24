# ADR-003: Authentication, Registration, and RBAC

## Status

Accepted

## Date

2026-02-24

## Context

The original app uses NextAuth 5 (beta) with a credentials provider and a single hardcoded user. We need to add:

1. User registration (public sign-up)
2. Role-based access control (user vs admin)
3. Updated route protection rules for the new public/protected layout

## Decision

### Roles

Two roles: `user` and `admin`.

- New registrations always receive `role: 'user'`
- Admin accounts are created only via database seed
- Role is stored in the `users` table, propagated through JWT → session

### Session Extension

NextAuth JWT and session callbacks are extended to include `id` and `role`:

```typescript
callbacks: {
  jwt({ token, user }) {
    if (user) {
      token.id = user.id;
      token.role = user.role;
    }
    return token;
  },
  session({ session, token }) {
    session.user.id = token.id as string;
    session.user.role = token.role as UserRole;
    return session;
  },
}
```

### Registration

- Public page at `/register`
- Server action `registerUser` validates with Zod (name, email, password)
- Password hashed with bcrypt before storage
- On success: auto-login via `signIn('credentials', ...)` and redirect to `/todos`
- On duplicate email: return validation error

### Route Protection (middleware)

| Route         | Rule                                        |
| ------------- | ------------------------------------------- |
| `/todos/*`    | Requires authenticated session              |
| `/login`      | If authenticated → redirect to `/todos`     |
| `/register`   | If authenticated → redirect to `/todos`     |
| `/`           | Public, no redirect (even if authenticated) |
| `/projects/*` | Public                                      |
| `/contacts`   | Public                                      |

Key change from original: authenticated users on `/` are **not** redirected to `/todos`. The home page is a public portfolio visible to everyone.

### RBAC in Server Actions

Every mutating server action checks ownership:

```
createTodo   → any authenticated user (user_id = session.user.id)
updateTodo   → owner OR admin
deleteTodo   → owner OR admin
```

Read access:

- `user` role: only sees own todos (`WHERE user_id = session.user.id`)
- `admin` role: sees all todos, can filter by specific user

### RBAC Enforcement

Authorization is enforced at the **server action / data layer** level, not in middleware. Middleware only checks "is authenticated". Fine-grained role checks happen in:

- `data.ts` — query functions add `WHERE user_id` for non-admin users
- `actions.ts` — mutation functions verify ownership before UPDATE/DELETE

## Consequences

- JWT strategy (default in NextAuth 5) works well for role propagation without extra DB queries per request
- No middleware complexity for role checking — keeps middleware fast
- Admin role is seed-only, preventing privilege escalation via registration
- RBAC at data layer means even API routes (future Phase 2) inherit the same access rules
