import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { fetchCardData } from '@/app/lib/data';
import { rateLimitApi, getClientIp } from '@/app/lib/rate-limit';

/**
 * GET /api/v1/todos/stats
 *
 * Returns: { totalTodos, pendingTodos, completedTodos }
 */
export async function GET() {
  const ip = await getClientIp();
  if (!rateLimitApi(ip).success) {
    return NextResponse.json(
      { error: { code: 'RATE_LIMITED', message: 'Too many requests.' } },
      { status: 429 },
    );
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Authentication required.' } },
      { status: 401 },
    );
  }

  const isAdmin = session.user.role === 'admin';

  try {
    const stats = await fetchCardData(session.user.id, isAdmin);
    return NextResponse.json({ data: stats });
  } catch {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch stats.' } },
      { status: 500 },
    );
  }
}
