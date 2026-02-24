# ADR-007: Performance Monitoring & Baseline

## Status

Accepted

## Date

2026-02-24

## Context

The project needs a performance monitoring strategy to:

- Establish a measurable baseline before adding features (Docker, CI/CD, microservices)
- Detect performance regressions early in the development cycle
- Provide actionable bundle size data for optimization decisions

## Decision

### 1. Lighthouse CI (`@lhci/cli`)

Lighthouse CI was chosen for automated lab-based performance audits.

| Criteria                | Lighthouse CI             | PageSpeed Insights API | WebPageTest       |
| ----------------------- | ------------------------- | ---------------------- | ----------------- |
| **CI integration**      | Built-in, first-class     | REST API, manual setup | REST API, slower  |
| **Cost**                | Free (local/filesystem)   | Free (rate-limited)    | Free tier limited |
| **Configuration**       | `lighthouserc.js`         | Per-request params     | Complex config    |
| **Assertions**          | Built-in budgets          | No                     | Custom scripts    |
| **Historical tracking** | LHCI Server or filesystem | No                     | Paid feature      |

**Configuration highlights:**

- **3 runs per URL** — reduces measurement variance
- **Desktop preset** — simulated throttling for consistent CI results
- **Performance budgets** — warn at 80% score, error at 90% accessibility
- **Core Web Vitals thresholds** — FCP < 2000ms, LCP < 3000ms, CLS < 0.1, TBT < 300ms
- **`startServerCommand`** — auto-starts `pnpm start` (production build)
- **Filesystem upload** — stores reports in `.lighthouseci/` for local review

### 2. Bundle Analyzer (`@next/bundle-analyzer`)

`@next/bundle-analyzer` wraps `webpack-bundle-analyzer` with Next.js-specific configuration.

- Activated via `ANALYZE=true` environment variable
- Generates interactive treemap HTML files for client and server bundles
- Helps identify:
  - Large dependencies that should be lazy-loaded
  - Duplicate packages across chunks
  - Tree-shaking effectiveness

Usage: `pnpm analyze` (runs `ANALYZE=true next build`)

### 3. Web Vitals — deferred to Phase 7

Real-user monitoring (RUM) via Web Vitals has limited value while the project runs locally. Tracking metrics like LCP/CLS/INP makes sense only after deployment with real users.

When the project is deployed (Phase 10+), RUM will be added via the chosen observability provider's SDK (e.g., Datadog RUM SDK, Sentry Performance, Vercel Analytics) — not a custom endpoint. These SDKs collect Web Vitals automatically without additional code.

The `useReportWebVitals` hook and `/api/web-vitals` endpoint are currently in the codebase as a placeholder. They will be replaced by the provider SDK in Phase 7 (Monitoring).

### 4. Pages Audited

| URL         | Why                                    |
| ----------- | -------------------------------------- |
| `/`         | Landing page — first impression, SSR   |
| `/login`    | Auth page — critical user entry point  |
| `/contacts` | Static content page — baseline for SSR |

`/todos` requires authentication and is excluded from unauthenticated Lighthouse runs. It will be covered in Phase 5 (CI/CD) with authenticated Lighthouse using `extraHeaders` or `puppeteerScript`.

## Alternatives Considered

### Vercel Analytics

Built-in Web Vitals tracking for Vercel-deployed apps. Not chosen because the project will deploy to AWS (Phase 10).

### Custom `/api/web-vitals` endpoint

Initially implemented, but recognised as premature — real analytics providers (Datadog, Sentry, Vercel) ship their own SDKs that collect Web Vitals automatically. A custom endpoint adds a maintenance burden with no advantage over provider SDKs.

### Custom Prometheus metrics

Would require a Prometheus instance and pushgateway. Deferred to Phase 7 (Monitoring) when the observability stack is set up.

## Consequences

### Positive

- Quantified performance baseline before feature additions
- Automated regression detection via Lighthouse CI assertions
- Bundle size visibility for informed optimization decisions

### Negative

- Lighthouse CI adds ~90 seconds to CI pipeline (9 runs × ~10s each)
- Filesystem-based report storage doesn't scale for historical comparison (addressed in Phase 5 with LHCI Server or temporary-public-storage)
- `/todos` page not covered in unauthenticated audits
- No real-user metrics until deployment (Phase 7+)

### Baseline Results (2026-02-24)

| Page        | Performance | Accessibility | Best Practices | SEO |
| ----------- | ----------- | ------------- | -------------- | --- |
| `/`         | 100         | 100           | 100            | 90  |
| `/login`    | 100         | 96            | 100            | 90  |
| `/contacts` | 100         | 100           | 100            | 90  |

All Core Web Vitals in the "Good" range (FCP ~250ms, LCP ~550ms, TBT 0ms, CLS 0).
