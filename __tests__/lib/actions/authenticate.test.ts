import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authenticate } from '@/app/lib/actions';

const mockSignIn = vi.fn();
vi.mock('@/auth', () => ({
  auth: vi.fn(),
  signIn: (...args: unknown[]) => mockSignIn(...args),
}));

vi.mock('@/app/lib/db', () => ({ default: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('next/navigation', () => ({ redirect: vi.fn() }));

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
    const { AuthError } = await import('next-auth');
    const error = new AuthError('test');
    (error as { type: string }).type = 'CredentialsSignin';
    mockSignIn.mockRejectedValue(error);

    const result = await authenticate(undefined, new FormData());
    expect(result).toBe('Invalid credentials.');
  });

  it('returns "Something went wrong." on other AuthError', async () => {
    const { AuthError } = await import('next-auth');
    const error = new AuthError('test');
    (error as { type: string }).type = 'OAuthSignInError';
    mockSignIn.mockRejectedValue(error);

    const result = await authenticate(undefined, new FormData());
    expect(result).toBe('Something went wrong.');
  });

  it('re-throws non-AuthError errors', async () => {
    mockSignIn.mockRejectedValue(new Error('Network error'));

    await expect(authenticate(undefined, new FormData())).rejects.toThrow('Network error');
  });
});
