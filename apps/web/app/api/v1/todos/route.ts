import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import sql from '@/app/lib/db';
import { fetchFilteredTodos, fetchTodosPages } from '@/app/lib/data';
import { CreateTodoSchema } from '@/app/lib/schemas';
import { rateLimitApi, getClientIp } from '@/app/lib/rate-limit';

/**
 * GET /api/v1/todos
 *
 * Query params:
 *   - query    (string)  — search by title/description/status
 *   - page     (number)  — page number (default: 1)
 *   - userId   (string)  — filter by user (admin only)
 */
export async function GET(request: NextRequest) {
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

  const { searchParams } = request.nextUrl;
  const query = searchParams.get('query') ?? '';
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'));
  const isAdmin = session.user.role === 'admin';
  const filterUserId = isAdmin ? (searchParams.get('userId') ?? undefined) : undefined;

  try {
    const [todos, totalPages] = await Promise.all([
      fetchFilteredTodos(query, page, session.user.id, isAdmin, filterUserId),
      fetchTodosPages(query, session.user.id, isAdmin, filterUserId),
    ]);

    return NextResponse.json({
      data: todos,
      meta: { page, totalPages },
    });
  } catch {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch todos.' } },
      { status: 500 },
    );
  }
}

/**
 * POST /api/v1/todos
 *
 * Body (JSON): { title: string, description?: string }
 */
export async function POST(request: NextRequest) {
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: 'INVALID_JSON', message: 'Request body must be valid JSON.' } },
      { status: 400 },
    );
  }

  const validated = CreateTodoSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input.',
          details: validated.error.flatten().fieldErrors,
        },
      },
      { status: 400 },
    );
  }

  const { title, description } = validated.data;

  try {
    const [{ count }] =
      await sql`SELECT COUNT(*)::int AS count FROM todos WHERE user_id = ${session.user.id}`;
    if (count >= 100) {
      return NextResponse.json(
        { error: { code: 'LIMIT_REACHED', message: 'Maximum 100 todos per user.' } },
        { status: 403 },
      );
    }

    const result = await sql`
      INSERT INTO todos (title, description, user_id)
      VALUES (${title}, ${description ?? ''}, ${session.user.id})
      RETURNING id, title, description, status, created_at, updated_at, user_id
    `;

    return NextResponse.json({ data: result[0] }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to create todo.' } },
      { status: 500 },
    );
  }
}
