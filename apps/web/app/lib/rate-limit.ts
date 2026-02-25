/**
 * Simple in-memory rate limiter.
 * For production, replace with Redis-backed solution (e.g. @upstash/ratelimit).
 */

type Entry = { count: number; resetAt: number };

const store = new Map<string, Entry>();

// Cleanup stale entries every 10 minutes
setInterval(
  () => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now > entry.resetAt) store.delete(key);
    }
  },
  10 * 60 * 1000,
).unref?.();

function check(
  key: string,
  windowMs: number,
  maxAttempts: number,
): { success: boolean; remaining: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: maxAttempts - 1 };
  }

  if (entry.count >= maxAttempts) {
    return { success: false, remaining: 0 };
  }

  entry.count++;
  return { success: true, remaining: maxAttempts - entry.count };
}

/** Strict: 5 attempts per 15 min (login) */
export function rateLimit(key: string) {
  return check(key, 15 * 60 * 1000, 5);
}

/** API: 60 requests per minute */
export function rateLimitApi(key: string) {
  return check(`api:${key}`, 60 * 1000, 60);
}

/** Extract client IP from request headers */
export async function getClientIp(): Promise<string> {
  const { headers } = await import('next/headers');
  const headersList = await headers();
  return (
    headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headersList.get('x-real-ip') ||
    'unknown'
  );
}
