import { NextResponse } from 'next/server';

/**
 * POST /api/web-vitals
 *
 * Collects Web Vitals metrics sent from the client via `useReportWebVitals`.
 *
 * Currently logs to stdout (suitable for log-based analytics pipelines).
 * Replace with your preferred analytics service:
 * - Google Analytics (gtag event)
 * - Vercel Analytics
 * - Custom time-series database (InfluxDB, Prometheus pushgateway)
 */
export async function POST(request: Request) {
  try {
    const metric = await request.json();

    // Structured log — parseable by log aggregators (Loki, CloudWatch, Datadog)
    console.log(
      JSON.stringify({
        type: 'web-vital',
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        id: metric.id,
        navigationType: metric.navigationType,
        timestamp: new Date().toISOString(),
      }),
    );

    return NextResponse.json({ ok: true }, { status: 202 });
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
}
