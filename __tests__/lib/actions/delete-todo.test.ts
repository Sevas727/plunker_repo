import { describe, it, expect, vi, beforeEach } from 'vitest';
import { deleteTodo } from '@/app/lib/actions';

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

const mockRevalidatePath = vi.fn();
vi.mock('next/cache', () => ({
  revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args),
}));

vi.mock('next/navigation', () => ({ redirect: vi.fn() }));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('deleteTodo', () => {
  it('deletes and revalidates for owner', async () => {
    mockAuth.mockResolvedValue({
      user: { id: 'user-1', name: 'Test', email: 'test@test.com', role: 'user' },
      expires: '2099-01-01',
    });
    mockFetchTodoOwnerId.mockResolvedValue('user-1');
    mockSql.mockResolvedValue([]);

    await deleteTodo('todo-1');

    expect(mockSql).toHaveBeenCalled();
    expect(mockRevalidatePath).toHaveBeenCalledWith('/todos');
  });

  it('allows admin to delete any todo', async () => {
    mockAuth.mockResolvedValue({
      user: { id: 'admin-1', name: 'Admin', email: 'admin@test.com', role: 'admin' },
      expires: '2099-01-01',
    });
    mockSql.mockResolvedValue([]);

    await deleteTodo('todo-1');

    expect(mockSql).toHaveBeenCalled();
    expect(mockFetchTodoOwnerId).not.toHaveBeenCalled();
  });

  it('throws Forbidden for non-owner non-admin', async () => {
    mockAuth.mockResolvedValue({
      user: { id: 'user-1', name: 'Test', email: 'test@test.com', role: 'user' },
      expires: '2099-01-01',
    });
    mockFetchTodoOwnerId.mockResolvedValue('other-user');

    await expect(deleteTodo('todo-1')).rejects.toThrow('Forbidden');
  });

  it('throws Unauthorized when no session', async () => {
    mockAuth.mockResolvedValue(null);
    await expect(deleteTodo('todo-1')).rejects.toThrow('Unauthorized');
  });
});
