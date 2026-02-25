import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import sql from '@/app/lib/db';
import { fetchTodoById, fetchTodoOwnerId } from '@/app/lib/data';
import { UpdateTodoSchema } from '@/app/lib/schemas';
import { rateLimitApi, getClientIp } from '@/app/lib/rate-limit';

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/v1/todos/:id
 */
export async function GET(request: NextRequest, context: RouteContext) {
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

  const { id } = await context.params;
  const isAdmin = session.user.role === 'admin';

  try {
    const todo = await fetchTodoById(id);
    if (!todo) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Todo not found.' } },
        { status: 404 },
      );
    }

    // Non-admin users can only view their own todos
    if (!isAdmin) {
      const ownerId = await fetchTodoOwnerId(id);
      if (ownerId !== session.user.id) {
        return NextResponse.json(
          { error: { code: 'FORBIDDEN', message: 'You can only view your own todos.' } },
          { status: 403 },
        );
      }
    }

    return NextResponse.json({ data: todo });
  } catch {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch todo.' } },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/v1/todos/:id
 *
 * Body (JSON): { title: string, description?: string, status: 'pending' | 'completed' }
 */
export async function PUT(request: NextRequest, context: RouteContext) {
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

  const { id } = await context.params;

  // Check existence
  const existing = await fetchTodoById(id);
  if (!existing) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Todo not found.' } },
      { status: 404 },
    );
  }

  // Check ownership
  if (session.user.role !== 'admin') {
    const ownerId = await fetchTodoOwnerId(id);
    if (ownerId !== session.user.id) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'You can only modify your own todos.' } },
        { status: 403 },
      );
    }
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

  const validated = UpdateTodoSchema.safeParse(body);
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

  const { title, description, status } = validated.data;

  try {
    const result = await sql`
      UPDATE todos
      SET title = ${title}, description = ${description ?? ''}, status = ${status}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, title, description, status, created_at, updated_at, user_id
    `;

    return NextResponse.json({ data: result[0] });
  } catch {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to update todo.' } },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/v1/todos/:id
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
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

  const { id } = await context.params;

  // Check existence
  const existing = await fetchTodoById(id);
  if (!existing) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Todo not found.' } },
      { status: 404 },
    );
  }

  // Check ownership
  if (session.user.role !== 'admin') {
    const ownerId = await fetchTodoOwnerId(id);
    if (ownerId !== session.user.id) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'You can only delete your own todos.' } },
        { status: 403 },
      );
    }
  }

  try {
    await sql`DELETE FROM todos WHERE id = ${id}`;
    return NextResponse.json({ data: { id } });
  } catch {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to delete todo.' } },
      { status: 500 },
    );
  }
}
