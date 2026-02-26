# Vsevolod Fedotov | Portfolio

Full-stack todo management application built with Next.js App Router, TypeScript, and PostgreSQL.

## Tech Stack

- **Framework**: Next.js (App Router) + TypeScript
- **Database**: PostgreSQL 16 (Neon)
- **Auth**: NextAuth v5 (Credentials + GitHub OAuth)
- **API**: REST API v1 + GraphQL (Apollo Server)
- **Styling**: Tailwind CSS
- **Testing**: Vitest + Playwright
- **Observability**: OpenTelemetry (traces + metrics)
- **Monorepo**: pnpm workspaces + Turborepo

## Project Structure

```
├── apps/web/              # Next.js application
│   ├── app/
│   │   ├── api/           # REST & GraphQL endpoints
│   │   ├── lib/           # Data layer, actions, utilities
│   │   ├── login/         # Login page
│   │   ├── register/      # Registration page
│   │   ├── todos/         # Todos CRUD pages
│   │   └── ui/            # UI components
│   ├── e2e/               # Playwright E2E tests
│   └── __tests__/         # Vitest unit/integration tests
├── packages/
│   ├── ui/                # Shared UI component library
│   └── todo-features/     # Shared todo feature components
├── k8s/                   # Kubernetes manifests + Helm chart
├── infrastructure/        # Terraform configurations
└── .github/               # CI/CD workflows
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 10+
- PostgreSQL 16 (or Neon account)

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in the values:

```bash
cp apps/web/.env.example apps/web/.env
```

Required variables:

| Variable       | Description                                          |
| -------------- | ---------------------------------------------------- |
| `POSTGRES_URL` | PostgreSQL connection string                         |
| `AUTH_SECRET`  | Secret for NextAuth (`openssl rand -base64 32`)      |
| `AUTH_URL`     | Auth callback URL (`http://localhost:3000/api/auth`) |

Optional:

| Variable        | Description                                |
| --------------- | ------------------------------------------ |
| `GITHUB_ID`     | GitHub OAuth App Client ID                 |
| `GITHUB_SECRET` | GitHub OAuth App Client Secret             |
| `POSTGRES_SSL`  | Set to `false` for local Docker PostgreSQL |

### 3. Seed the database

Start the dev server and open `http://localhost:3000/seed` in the browser. This creates tables and inserts sample data.

### 4. Run development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Running with Docker

```bash
docker compose up
```

This starts PostgreSQL and the app. For development with hot reload:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up
```

## Scripts

| Command              | Description                  |
| -------------------- | ---------------------------- |
| `pnpm dev`           | Start dev server (Turbopack) |
| `pnpm build`         | Production build             |
| `pnpm test`          | Run unit/integration tests   |
| `pnpm test:e2e`      | Run E2E tests (Playwright)   |
| `pnpm test:coverage` | Run tests with coverage      |
| `pnpm lint`          | Lint all packages            |
| `pnpm format`        | Format code with Prettier    |
| `pnpm typecheck`     | TypeScript type checking     |

## API

### REST API v1

| Method   | Endpoint              | Description                        |
| -------- | --------------------- | ---------------------------------- |
| `GET`    | `/api/v1/todos`       | List todos (paginated, filterable) |
| `POST`   | `/api/v1/todos`       | Create todo                        |
| `GET`    | `/api/v1/todos/[id]`  | Get todo by ID                     |
| `PUT`    | `/api/v1/todos/[id]`  | Update todo                        |
| `DELETE` | `/api/v1/todos/[id]`  | Delete todo                        |
| `GET`    | `/api/v1/todos/stats` | Todo statistics                    |
| `GET`    | `/api/v1/users`       | List users (admin only)            |
| `GET`    | `/api/health`         | Health check                       |

### GraphQL

`POST /api/graphql` — Apollo Server with Query and Mutation resolvers for todos.

## Architecture

```
Browser → Next.js App Router → Server Actions / API Routes
                                        ↓
                              NextAuth (JWT sessions)
                                        ↓
                              PostgreSQL (Neon / Docker)
```

- **Server Actions** handle form submissions (create, update, delete todos)
- **REST API** provides programmatic access with rate limiting
- **GraphQL** offers flexible querying via Apollo Server
- **Auth** uses JWT sessions with role-based access (admin/user)
- **Rate Limiting** — in-memory, 30 req/min per IP for API routes

## Deployment

- **Vercel**: Connected via GitHub integration, auto-deploys on push to `main`
- **Docker**: Multi-stage Dockerfile with standalone Next.js output
- **Kubernetes**: Base manifests + Helm chart in `/k8s/`
- **Infrastructure**: Terraform configs in `/infrastructure/`
