import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock next-auth BEFORE importing actions (it tries to import next/server)
class MockAuthError extends Error {
  type: string;
  constructor(message: string, options?: { type: string }) {
    super(message);
    this.type = options?.type ?? 'UnknownError';
  }
}

vi.mock('next-auth', () => ({ AuthError: MockAuthError }));

const mockSignIn = vi.fn();
vi.mock('@/auth', () => ({
  auth: vi.fn(),
  signIn: (...args: unknown[]) => mockSignIn(...args),
}));

vi.mock('@/app/lib/db', () => ({ default: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('next/navigation', () => ({ redirect: vi.fn() }));
vi.mock('@/app/lib/data', () => ({ fetchTodoOwnerId: vi.fn() }));
vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Map([['x-forwarded-for', '127.0.0.1']])),
}));
vi.mock('@/app/lib/rate-limit', () => ({
  rateLimit: vi.fn().mockReturnValue({ success: true, remaining: 4 }),
}));

// Import AFTER mocks are set up
const { authenticate } = await import('@/app/lib/actions');

beforeEach(() => {
  vi.clearAllMocks();
});

describe('authenticate', () => {
  it('calls signIn with credentials and formData', async () => {
    mockSignIn.mockResolvedValue(undefined);
    const formData = new FormData();
    formData.set('email', 'test@test.com');
    formData.set('password', 'password');

    await authenticate(undefined, formData);

    expect(mockSignIn).toHaveBeenCalledWith('credentials', formData);
  });

  it('returns "Invalid credentials." on CredentialsSignin error', async () => {
    const error = new MockAuthError('test', { type: 'CredentialsSignin' });
    mockSignIn.mockRejectedValue(error);

    const result = await authenticate(undefined, new FormData());
    expect(result).toBe('Invalid credentials.');
  });

  it('returns "Something went wrong." on other AuthError', async () => {
    const error = new MockAuthError('test', { type: 'OAuthSignInError' });
    mockSignIn.mockRejectedValue(error);

    const result = await authenticate(undefined, new FormData());
    expect(result).toBe('Something went wrong.');
  });

  it('re-throws non-AuthError errors', async () => {
    mockSignIn.mockRejectedValue(new Error('Network error'));

    await expect(authenticate(undefined, new FormData())).rejects.toThrow('Network error');
  });
});
