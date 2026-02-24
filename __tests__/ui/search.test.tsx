import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Search from '@/app/ui/search';

const mockReplace = vi.fn();

vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(() => new URLSearchParams()),
  usePathname: vi.fn(() => '/todos'),
  useRouter: vi.fn(() => ({ replace: mockReplace })),
}));

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.clearAllMocks();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('Search', () => {
  it('renders input with placeholder', () => {
    render(<Search placeholder="Search todos..." />);
    expect(screen.getByPlaceholderText('Search todos...')).toBeInTheDocument();
  });

  it('renders search label', () => {
    render(<Search placeholder="Search..." />);
    expect(screen.getByText('Search')).toBeInTheDocument();
  });

  it('populates input from existing searchParam', async () => {
    const { useSearchParams } = await import('next/navigation');
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('query=hello') as any);

    render(<Search placeholder="Search..." />);
    expect(screen.getByPlaceholderText('Search...')).toHaveValue('hello');
  });

  it('updates URL with debounced search term', async () => {
    const { useSearchParams } = await import('next/navigation');
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams() as any);

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<Search placeholder="Search..." />);
    const input = screen.getByPlaceholderText('Search...');

    await user.type(input, 'test');
    vi.advanceTimersByTime(300);

    expect(mockReplace).toHaveBeenCalled();
    const calledUrl = mockReplace.mock.calls[mockReplace.mock.calls.length - 1][0];
    expect(calledUrl).toContain('query=test');
    expect(calledUrl).toContain('page=1');
  });

  it('removes query param when input is cleared', async () => {
    const { useSearchParams } = await import('next/navigation');
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('query=old') as any);

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<Search placeholder="Search..." />);
    const input = screen.getByPlaceholderText('Search...');

    await user.clear(input);
    vi.advanceTimersByTime(300);

    expect(mockReplace).toHaveBeenCalled();
    const calledUrl = mockReplace.mock.calls[mockReplace.mock.calls.length - 1][0];
    expect(calledUrl).not.toContain('query=');
  });
});
