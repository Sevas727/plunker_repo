# ADR-002: Data Model — Migration from Invoices to Todos

## Status

Accepted

## Date

2026-02-24

## Context

The original application had four database tables: `users`, `invoices`, `customers`, and `revenue`. These served a tutorial invoice dashboard. We need to replace this with a todo management system that demonstrates CRUD operations, pagination, search, and role-based filtering.

## Decision

### Drop Tables

- `invoices` — replaced by `todos`
- `customers` — no longer needed (todos belong to users directly)
- `revenue` — no longer needed (no financial data)

### Modified Table: `users`

```sql
CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW()
);
```

New columns:

- `role` — `'user'` or `'admin'`, defaults to `'user'`
- `created_at` — registration timestamp

### New Table: `todos`

```sql
CREATE TABLE todos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT DEFAULT '',
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_todos_user_id ON todos(user_id);
CREATE INDEX idx_todos_created_at ON todos(created_at DESC);
```

- `status`: `'pending'` or `'completed'`
- `user_id`: foreign key to the creator, cascading delete
- Indexes on `user_id` (for filtering) and `created_at DESC` (for default sort)

### Query Patterns

| Query              | Description                                                    |
| ------------------ | -------------------------------------------------------------- |
| List todos (user)  | `WHERE user_id = $currentUserId` + search + pagination         |
| List todos (admin) | Optional `WHERE user_id = $filterUserId` + search + pagination |
| Count todos        | Parallel COUNT queries for total/pending/completed             |
| Recent todos       | `ORDER BY created_at DESC LIMIT 5`                             |
| Todo by ID         | `WHERE id = $id` (+ ownership check for non-admin)             |

### Pagination & Sort

- Default sort: `created_at DESC` (newest first)
- Page size: 6 items (same as current invoice pagination)
- Search: `ILIKE` on `title` and `description`

## Consequences

- Simpler schema: 2 tables instead of 4
- Direct user-to-todo relationship eliminates the need for JOIN on list queries (except for admin view showing author name)
- `ON DELETE CASCADE` ensures todos are cleaned up when a user is deleted
- Indexes support the two primary access patterns: by user and by date
