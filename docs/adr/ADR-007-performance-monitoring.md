# ADR-007: Performance Monitoring & Baseline

## Status

Accepted

## Date

2026-02-24

## Context

The project needs a performance monitoring strategy to:

- Establish a measurable baseline before adding features (Docker, CI/CD, microservices)
- Detect performance regressions early in the development cycle
- Track real-user Core Web Vitals (LCP, CLS, INP) alongside lab metrics
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

### 3. Web Vitals Reporting (`useReportWebVitals`)

Next.js provides `useReportWebVitals` hook for capturing real-user metrics (RUM).

**Architecture:**

```
Browser → useReportWebVitals() → sendBeacon(/api/web-vitals) → structured log
```

- **Client component** (`app/ui/web-vitals.tsx`) mounted in root layout
- **Development**: logs metrics to console with color-coded ratings (good/needs-improvement/poor)
- **Production**: sends metrics to `/api/web-vitals` endpoint via `navigator.sendBeacon`
- **API endpoint** (`app/api/web-vitals/route.ts`): logs structured JSON, ready for integration with log aggregators (Loki, CloudWatch, Datadog)

**Metrics captured:**

| Metric | Type           | Good threshold |
| ------ | -------------- | -------------- |
| LCP    | Core Web Vital | < 2500 ms      |
| FID    | Core Web Vital | < 100 ms       |
| CLS    | Core Web Vital | < 0.1          |
| FCP    | Additional     | < 1800 ms      |
| TTFB   | Additional     | < 800 ms       |
| INP    | Core Web Vital | < 200 ms       |

### 4. Pages Audited

| URL         | Why                                    |
| ----------- | -------------------------------------- |
| `/`         | Landing page — first impression, SSR   |
| `/login`    | Auth page — critical user entry point  |
| `/contacts` | Static content page — baseline for SSR |

`/todos` requires authentication and is excluded from unauthenticated Lighthouse runs. It will be covered in Phase 5 (CI/CD) with authenticated Lighthouse using `extraHeaders` or `puppeteerScript`.

## Alternatives Considered

### Vercel Analytics

Built-in Web Vitals tracking for Vercel-deployed apps. Not chosen because the project may deploy to AWS (Phase 10), and we want a provider-agnostic solution.

### Google Analytics (GA4) `gtag` events

Could send Web Vitals as GA events. Not chosen to avoid adding the GA SDK dependency; structured logs are sufficient for this stage.

### Custom Prometheus metrics

Would require a Prometheus instance and pushgateway. Deferred to Phase 7 (Monitoring) when the observability stack is set up.

## Consequences

### Positive

- Quantified performance baseline before feature additions
- Automated regression detection via Lighthouse CI assertions
- Real-user metric collection ready for any analytics provider
- Bundle size visibility for informed optimization decisions
- Zero runtime cost (Web Vitals uses browser PerformanceObserver API)

### Negative

- Lighthouse CI adds ~90 seconds to CI pipeline (9 runs × ~10s each)
- Filesystem-based report storage doesn't scale for historical comparison (addressed in Phase 5 with LHCI Server or temporary-public-storage)
- `/todos` page not covered in unauthenticated audits

### Baseline Results (2026-02-24)

| Page        | Performance | Accessibility | Best Practices | SEO |
| ----------- | ----------- | ------------- | -------------- | --- |
| `/`         | 100         | 100           | 100            | 90  |
| `/login`    | 100         | 96            | 100            | 90  |
| `/contacts` | 100         | 100           | 100            | 90  |

All Core Web Vitals in the "Good" range (FCP ~250ms, LCP ~550ms, TBT 0ms, CLS 0).
