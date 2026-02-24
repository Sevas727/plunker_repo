import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import UserFilter from '@/app/ui/todos/user-filter';

const mockReplace = vi.fn();

vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(() => new URLSearchParams()),
  usePathname: vi.fn(() => '/todos'),
  useRouter: vi.fn(() => ({ replace: mockReplace })),
}));

const users = [
  { id: 'u1', name: 'Alice', email: 'a@b.com' },
  { id: 'u2', name: 'Bob', email: 'b@b.com' },
];

describe('UserFilter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders "All users" default option', () => {
    render(<UserFilter users={users} />);
    expect(screen.getByText('All users')).toBeInTheDocument();
  });

  it('renders option for each user', () => {
    render(<UserFilter users={users} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('renders a select element', () => {
    render(<UserFilter users={users} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('updates URL with userId on change', () => {
    render(<UserFilter users={users} />);
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'u1' } });
    expect(mockReplace).toHaveBeenCalledTimes(1);
    const url = mockReplace.mock.calls[0][0];
    expect(url).toContain('userId=u1');
    expect(url).toContain('page=1');
  });

  it('removes userId param when "All users" selected', () => {
    render(<UserFilter users={users} />);
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '' } });
    expect(mockReplace).toHaveBeenCalledTimes(1);
    const url = mockReplace.mock.calls[0][0];
    expect(url).not.toContain('userId');
  });
});
