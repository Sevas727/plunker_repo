import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { fetchAllUsers } from '@/app/lib/data';

/**
 * GET /api/v1/users
 *
 * Admin only. Returns list of users (id, name, email).
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Authentication required.' } },
      { status: 401 },
    );
  }

  if (session.user.role !== 'admin') {
    return NextResponse.json(
      { error: { code: 'FORBIDDEN', message: 'Admin access required.' } },
      { status: 403 },
    );
  }

  try {
    const users = await fetchAllUsers();
    return NextResponse.json({ data: users });
  } catch {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch users.' } },
      { status: 500 },
    );
  }
}
