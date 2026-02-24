# Plan: 2.1 REST API

## Endpoints

```
GET    /api/v1/todos          — list todos (pagination, search, status filter)
POST   /api/v1/todos          — create todo
GET    /api/v1/todos/:id      — get single todo
PUT    /api/v1/todos/:id      — update todo
DELETE /api/v1/todos/:id      — delete todo
GET    /api/v1/todos/stats    — dashboard card data (total, pending, completed)
GET    /api/v1/users          — list users (admin only)
```

## File Structure

```
app/api/v1/
├── todos/
│   ├── route.ts              — GET (list) + POST (create)
│   ├── stats/
│   │   └── route.ts          — GET (card data)
│   └── [id]/
│       └── route.ts          — GET + PUT + DELETE
└── users/
    └── route.ts              — GET (admin only)
```

## Steps

1. Create `app/lib/auth-helpers.ts` (extract shared auth logic)
2. Update `actions.ts` to import from `auth-helpers.ts`
3. Create `app/api/v1/todos/route.ts` (GET + POST)
4. Create `app/api/v1/todos/[id]/route.ts` (GET + PUT + DELETE)
5. Create `app/api/v1/todos/stats/route.ts` (GET)
6. Create `app/api/v1/users/route.ts` (GET, admin only)
