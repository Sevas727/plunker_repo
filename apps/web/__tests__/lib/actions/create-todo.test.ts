import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('next-auth', () => ({
  AuthError: class AuthError extends Error {
    type = 'UnknownError';
  },
}));

const mockSql = vi.fn();
vi.mock('@/app/lib/db', () => ({
  default: (...args: unknown[]) => mockSql(...args),
}));

const mockAuth = vi.fn();
vi.mock('@/auth', () => ({
  auth: (...args: unknown[]) => mockAuth(...args),
  signIn: vi.fn(),
}));

const mockRevalidatePath = vi.fn();
vi.mock('next/cache', () => ({
  revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args),
}));

const mockRedirect = vi.fn();
vi.mock('next/navigation', () => ({
  redirect: (...args: unknown[]) => mockRedirect(...args),
}));

vi.mock('@/app/lib/data', () => ({ fetchTodoOwnerId: vi.fn() }));

const { createTodo } = await import('@/app/lib/actions');

const initialState = { message: '', errors: {} };

function makeFormData(data: Record<string, string>) {
  const fd = new FormData();
  Object.entries(data).forEach(([k, v]) => fd.set(k, v));
  return fd;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockAuth.mockResolvedValue({
    user: {
      id: 'user-1',
      name: 'Test',
      email: 'test@test.com',
      role: 'user',
    },
    expires: '2099-01-01',
  });
});

describe('createTodo', () => {
  it('returns validation errors for empty title', async () => {
    const result = await createTodo(initialState, makeFormData({ title: '' }));
    expect(result).toBeDefined();
    expect(result!.message).toContain('Missing Fields');
    expect(result!.errors?.title).toBeDefined();
  });

  it('inserts todo and redirects on valid input', async () => {
    mockSql
      .mockResolvedValueOnce([{ count: 0 }]) // COUNT check
      .mockResolvedValueOnce([]); // INSERT

    await createTodo(initialState, makeFormData({ title: 'New Todo', description: 'Desc' }));

    expect(mockSql).toHaveBeenCalled();
    expect(mockRevalidatePath).toHaveBeenCalledWith('/todos');
    expect(mockRedirect).toHaveBeenCalledWith('/todos');
  });

  it('throws Unauthorized when no session', async () => {
    mockAuth.mockResolvedValue(null);

    await expect(createTodo(initialState, makeFormData({ title: 'Test' }))).rejects.toThrow(
      'Unauthorized',
    );
  });

  it('returns database error message on SQL failure', async () => {
    mockSql
      .mockResolvedValueOnce([{ count: 0 }]) // COUNT check passes
      .mockRejectedValueOnce(new Error('SQL fail')); // INSERT fails

    const result = await createTodo(initialState, makeFormData({ title: 'Test', description: '' }));
    expect(result).toBeDefined();
    expect(result!.message).toContain('Database Error');
  });
});
