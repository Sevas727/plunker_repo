import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  fetchCardData,
  fetchFilteredTodos,
  fetchTodosPages,
  fetchTodoById,
  fetchTodoOwnerId,
  fetchAllUsers,
} from '@/app/lib/data';

const mockSql = vi.fn();
vi.mock('@/app/lib/db', () => ({ default: (...args: unknown[]) => mockSql(...args) }));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('fetchCardData', () => {
  it('returns counts for admin', async () => {
    mockSql
      .mockResolvedValueOnce([{ count: '10' }])
      .mockResolvedValueOnce([{ count: '4' }])
      .mockResolvedValueOnce([{ count: '6' }]);

    const result = await fetchCardData('admin-id', true);
    expect(result).toEqual({ totalTodos: 10, pendingTodos: 4, completedTodos: 6 });
  });

  it('returns counts for regular user', async () => {
    mockSql
      .mockResolvedValueOnce([{ count: '3' }])
      .mockResolvedValueOnce([{ count: '2' }])
      .mockResolvedValueOnce([{ count: '1' }]);

    const result = await fetchCardData('user-1', false);
    expect(result).toEqual({ totalTodos: 3, pendingTodos: 2, completedTodos: 1 });
  });

  it('throws on database error', async () => {
    mockSql.mockRejectedValue(new Error('DB fail'));
    await expect(fetchCardData('u1', false)).rejects.toThrow('Failed to fetch card data.');
  });
});

describe('fetchFilteredTodos', () => {
  it('returns todos array', async () => {
    const todos = [{ id: '1', title: 'Todo 1', user_name: 'Alice' }];
    mockSql.mockResolvedValue(todos);

    const result = await fetchFilteredTodos('', 1, 'u1', false);
    expect(result).toEqual(todos);
  });

  it('throws on database error', async () => {
    mockSql.mockRejectedValue(new Error('DB fail'));
    await expect(fetchFilteredTodos('', 1, 'u1', false)).rejects.toThrow('Failed to fetch todos.');
  });
});

describe('fetchTodosPages', () => {
  it('returns correct totalPages', async () => {
    mockSql.mockResolvedValue([{ count: '13' }]);
    const pages = await fetchTodosPages('', 'u1', false);
    expect(pages).toBe(3); // ceil(13/6)
  });

  it('returns 0 for no results', async () => {
    mockSql.mockResolvedValue([{ count: '0' }]);
    const pages = await fetchTodosPages('', 'u1', false);
    expect(pages).toBe(0);
  });

  it('throws on database error', async () => {
    mockSql.mockRejectedValue(new Error('DB fail'));
    await expect(fetchTodosPages('', 'u1', false)).rejects.toThrow(
      'Failed to fetch total number of todos.',
    );
  });
});

describe('fetchTodoById', () => {
  it('returns the first result', async () => {
    const todo = { id: '1', title: 'Test', description: '', status: 'pending' };
    mockSql.mockResolvedValue([todo]);

    const result = await fetchTodoById('1');
    expect(result).toEqual(todo);
  });

  it('throws on database error', async () => {
    mockSql.mockRejectedValue(new Error('DB fail'));
    await expect(fetchTodoById('1')).rejects.toThrow('Failed to fetch todo.');
  });
});

describe('fetchTodoOwnerId', () => {
  it('returns user_id from first row', async () => {
    mockSql.mockResolvedValue([{ user_id: 'user-1' }]);
    const result = await fetchTodoOwnerId('todo-1');
    expect(result).toBe('user-1');
  });

  it('returns null when no rows', async () => {
    mockSql.mockResolvedValue([]);
    const result = await fetchTodoOwnerId('nonexistent');
    expect(result).toBeNull();
  });

  it('throws on database error', async () => {
    mockSql.mockRejectedValue(new Error('DB fail'));
    await expect(fetchTodoOwnerId('1')).rejects.toThrow('Failed to fetch todo owner.');
  });
});

describe('fetchAllUsers', () => {
  it('returns array of user objects', async () => {
    const users = [{ id: '1', name: 'Alice', email: 'a@b.com' }];
    mockSql.mockResolvedValue(users);
    const result = await fetchAllUsers();
    expect(result).toEqual(users);
  });

  it('throws on database error', async () => {
    mockSql.mockRejectedValue(new Error('DB fail'));
    await expect(fetchAllUsers()).rejects.toThrow('Failed to fetch users.');
  });
});
