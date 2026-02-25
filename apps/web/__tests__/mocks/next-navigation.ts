import { vi } from 'vitest';

export const mockReplace = vi.fn();
export const mockPush = vi.fn();
export const mockRefresh = vi.fn();

export const useRouter = vi.fn(() => ({
  replace: mockReplace,
  push: mockPush,
  refresh: mockRefresh,
  back: vi.fn(),
  forward: vi.fn(),
  prefetch: vi.fn(),
}));

export const usePathname = vi.fn(() => '/todos');
export const useSearchParams = vi.fn(() => new URLSearchParams());
export const redirect = vi.fn();
export const notFound = vi.fn();
