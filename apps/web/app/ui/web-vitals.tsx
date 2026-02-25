'use client';

import { useReportWebVitals } from 'next/web-vitals';

/**
 * Web Vitals reporter component.
 *
 * Captures Core Web Vitals (LCP, FID, CLS) and additional metrics (FCP, TTFB, INP)
 * from every page navigation.
 *
 * In development → logs to console.
 * In production  → sends to /api/web-vitals analytics endpoint (can be replaced
 *                   with any analytics provider: Google Analytics, Vercel Analytics, etc.).
 */
export function WebVitals() {
  useReportWebVitals((metric) => {
    // Core Web Vitals thresholds (Google "good" range)
    const thresholds: Record<string, { good: number; poor: number }> = {
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 },
      FCP: { good: 1800, poor: 3000 },
      TTFB: { good: 800, poor: 1800 },
      INP: { good: 200, poor: 500 },
    };

    const threshold = thresholds[metric.name];
    let rating: 'good' | 'needs-improvement' | 'poor' = 'good';

    if (threshold) {
      if (metric.value > threshold.poor) {
        rating = 'poor';
      } else if (metric.value > threshold.good) {
        rating = 'needs-improvement';
      }
    }

    const payload = {
      name: metric.name,
      value: metric.value,
      rating,
      delta: metric.delta,
      id: metric.id,
      navigationType: metric.navigationType,
    };

    if (process.env.NODE_ENV === 'development') {
      const color = rating === 'good' ? '\x1b[32m' : rating === 'poor' ? '\x1b[31m' : '\x1b[33m';
      const unit = metric.name === 'CLS' ? '' : 'ms';
      const value = metric.name === 'CLS' ? metric.value.toFixed(3) : Math.round(metric.value);
      console.log(`${color}[Web Vitals]\x1b[0m ${metric.name}: ${value}${unit} (${rating})`);
    } else {
      // Production: send to analytics endpoint
      // Using sendBeacon for reliable delivery even during page unload
      const body = JSON.stringify(payload);
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/web-vitals', body);
      } else {
        fetch('/api/web-vitals', {
          method: 'POST',
          body,
          keepalive: true,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }
  });

  return null;
}
