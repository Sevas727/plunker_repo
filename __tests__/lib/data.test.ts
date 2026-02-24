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
  it('returns numeric counts', async () => {
    // sql is called as tagged template many times (sub-expressions + 3 main queries)
    // Use mockResolvedValue so all calls return the same shape
    mockSql.mockResolvedValue([{ count: '5' }]);

    const result = await fetchCardData('admin-id', true);
    expect(result.totalTodos).toBe(5);
    expect(result.pendingTodos).toBe(5);
    expect(result.completedTodos).toBe(5);
    expect(mockSql).toHaveBeenCalled();
  });

  it('returns zero when counts are zero', async () => {
    mockSql.mockResolvedValue([{ count: '0' }]);

    const result = await fetchCardData('user-1', false);
    expect(result.totalTodos).toBe(0);
    expect(result.pendingTodos).toBe(0);
    expect(result.completedTodos).toBe(0);
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
