/**
 * Simple in-memory rate limiter.
 * For production, replace with Redis-backed solution (e.g. @upstash/ratelimit).
 */

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

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

export function rateLimit(key: string): { success: boolean; remaining: number } {
  const now = Date.now();
  const entry = store.get(key);

  // First request or window expired — reset
  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { success: true, remaining: MAX_ATTEMPTS - 1 };
  }

  // Window active — check limit
  if (entry.count >= MAX_ATTEMPTS) {
    return { success: false, remaining: 0 };
  }

  entry.count++;
  return { success: true, remaining: MAX_ATTEMPTS - entry.count };
}
