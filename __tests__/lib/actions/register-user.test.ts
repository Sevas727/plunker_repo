import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registerUser } from '@/app/lib/actions';

const mockSql = vi.fn();
vi.mock('@/app/lib/db', () => ({ default: (...args: unknown[]) => mockSql(...args) }));

const mockSignIn = vi.fn();
vi.mock('@/auth', () => ({
  auth: vi.fn(),
  signIn: (...args: unknown[]) => mockSignIn(...args),
}));

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

const mockRedirect = vi.fn();
vi.mock('next/navigation', () => ({
  redirect: (...args: unknown[]) => mockRedirect(...args),
}));

const mockHash = vi.fn();
vi.mock('bcrypt', () => ({
  default: { hash: (...args: unknown[]) => mockHash(...args) },
}));

const initialState = { message: '', errors: {} };

function makeFormData(data: Record<string, string>) {
  const fd = new FormData();
  Object.entries(data).forEach(([k, v]) => fd.set(k, v));
  return fd;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockHash.mockResolvedValue('hashed-password');
  mockSignIn.mockResolvedValue(undefined);
});

describe('registerUser', () => {
  it('returns validation errors for invalid input', async () => {
    const result = await registerUser(
      initialState,
      makeFormData({ name: 'A', email: 'bad', password: '123' }),
    );
    expect(result.message).toBe('Validation failed.');
    expect(result.errors?.name).toBeDefined();
    expect(result.errors?.email).toBeDefined();
    expect(result.errors?.password).toBeDefined();
  });

  it('hashes password and inserts user on valid input', async () => {
    mockSql.mockResolvedValue([]);

    await registerUser(
      initialState,
      makeFormData({ name: 'John', email: 'john@test.com', password: '123456' }),
    );

    expect(mockHash).toHaveBeenCalledWith('123456', 10);
    expect(mockSql).toHaveBeenCalled();
  });

  it('auto-signs in after successful registration', async () => {
    mockSql.mockResolvedValue([]);

    await registerUser(
      initialState,
      makeFormData({ name: 'John', email: 'john@test.com', password: '123456' }),
    );

    expect(mockSignIn).toHaveBeenCalledWith('credentials', {
      email: 'john@test.com',
      password: '123456',
      redirect: false,
    });
  });

  it('redirects to /todos after success', async () => {
    mockSql.mockResolvedValue([]);

    await registerUser(
      initialState,
      makeFormData({ name: 'John', email: 'john@test.com', password: '123456' }),
    );

    expect(mockRedirect).toHaveBeenCalledWith('/todos');
  });

  it('returns "Email already exists." on unique constraint error', async () => {
    mockSql.mockRejectedValue(new Error('unique constraint violation'));

    const result = await registerUser(
      initialState,
      makeFormData({ name: 'John', email: 'john@test.com', password: '123456' }),
    );
    expect(result.message).toBe('Email already exists.');
  });

  it('returns generic database error on other SQL errors', async () => {
    mockSql.mockRejectedValue(new Error('connection timeout'));

    const result = await registerUser(
      initialState,
      makeFormData({ name: 'John', email: 'john@test.com', password: '123456' }),
    );
    expect(result.message).toBe('Database Error: Failed to register.');
  });

  it('returns auto-login failure message on AuthError during signIn', async () => {
    mockSql.mockResolvedValue([]);
    const { AuthError } = await import('next-auth');
    const error = new AuthError('login failed');
    mockSignIn.mockRejectedValue(error);

    const result = await registerUser(
      initialState,
      makeFormData({ name: 'John', email: 'john@test.com', password: '123456' }),
    );
    expect(result.message).toContain('auto-login failed');
  });
});
