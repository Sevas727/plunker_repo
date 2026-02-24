import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateTodo } from '@/app/lib/actions';

const mockSql = vi.fn();
vi.mock('@/app/lib/db', () => ({ default: (...args: unknown[]) => mockSql(...args) }));

const mockAuth = vi.fn();
vi.mock('@/auth', () => ({
  auth: (...args: unknown[]) => mockAuth(...args),
  signIn: vi.fn(),
}));

const mockFetchTodoOwnerId = vi.fn();
vi.mock('@/app/lib/data', () => ({
  fetchTodoOwnerId: (...args: unknown[]) => mockFetchTodoOwnerId(...args),
}));

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('next/navigation', () => ({ redirect: vi.fn() }));

const initialState = { message: '', errors: {} };

function makeFormData(data: Record<string, string>) {
  const fd = new FormData();
  Object.entries(data).forEach(([k, v]) => fd.set(k, v));
  return fd;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockAuth.mockResolvedValue({
    user: { id: 'user-1', name: 'Test', email: 'test@test.com', role: 'user' },
    expires: '2099-01-01',
  });
  mockFetchTodoOwnerId.mockResolvedValue('user-1');
});

describe('updateTodo', () => {
  it('returns validation errors for missing status', async () => {
    const result = await updateTodo(
      'todo-1',
      initialState,
      makeFormData({ title: 'Test', description: 'Desc' }),
    );
    expect(result).toBeDefined();
    expect(result!.message).toContain('Missing Fields');
  });

  it('updates and redirects on valid input for owner', async () => {
    mockSql.mockResolvedValue([]);

    await updateTodo(
      'todo-1',
      initialState,
      makeFormData({ title: 'Updated', description: 'Desc', status: 'completed' }),
    );

    expect(mockSql).toHaveBeenCalled();
  });

  it('allows admin to update any todo', async () => {
    mockAuth.mockResolvedValue({
      user: { id: 'admin-1', name: 'Admin', email: 'admin@test.com', role: 'admin' },
      expires: '2099-01-01',
    });
    mockFetchTodoOwnerId.mockResolvedValue('other-user');
    mockSql.mockResolvedValue([]);

    await updateTodo(
      'todo-1',
      initialState,
      makeFormData({ title: 'Updated', description: '', status: 'pending' }),
    );

    // Admin should not trigger ownership check, so fetchTodoOwnerId should NOT be called
    expect(mockFetchTodoOwnerId).not.toHaveBeenCalled();
  });

  it('throws Forbidden for non-owner non-admin', async () => {
    mockFetchTodoOwnerId.mockResolvedValue('other-user');

    await expect(
      updateTodo(
        'todo-1',
        initialState,
        makeFormData({ title: 'X', description: '', status: 'pending' }),
      ),
    ).rejects.toThrow('Forbidden');
  });

  it('returns database error on SQL failure', async () => {
    mockSql.mockRejectedValue(new Error('SQL fail'));

    const result = await updateTodo(
      'todo-1',
      initialState,
      makeFormData({ title: 'Test', description: '', status: 'pending' }),
    );
    expect(result).toBeDefined();
    expect(result!.message).toContain('Database Error');
  });
});
