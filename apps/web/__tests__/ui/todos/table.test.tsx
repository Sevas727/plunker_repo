import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next-auth', () => ({
  AuthError: class extends Error {
    type = 'UnknownError';
  },
}));
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));
vi.mock('@/app/lib/actions', () => ({
  deleteTodo: Object.assign(vi.fn(), { bind: vi.fn(() => vi.fn()) }),
}));
vi.mock('@/app/lib/db', () => ({ default: vi.fn() }));
vi.mock('@/auth', () => ({ auth: vi.fn(), signIn: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('next/navigation', () => ({ redirect: vi.fn() }));
vi.mock('@/app/lib/data', () => ({ fetchTodoOwnerId: vi.fn() }));

const { default: TodosTableComponent } = await import('@/app/ui/todos/table');

const mockTodos = [
  {
    id: '1',
    title: 'Todo 1',
    description: 'Description 1',
    status: 'pending' as const,
    created_at: '2024-01-15',
    updated_at: '2024-01-15',
    user_id: 'u1',
    user_name: 'Alice',
    user_email: 'alice@test.com',
  },
  {
    id: '2',
    title: 'Todo 2',
    description: '',
    status: 'completed' as const,
    created_at: '2024-01-16',
    updated_at: '2024-01-16',
    user_id: 'u2',
    user_name: 'Bob',
    user_email: 'bob@test.com',
  },
];

describe('TodosTableComponent', () => {
  it('renders todo titles', () => {
    render(<TodosTableComponent todos={mockTodos} />);
    // Titles appear in both mobile and desktop views
    expect(screen.getAllByText('Todo 1').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Todo 2').length).toBeGreaterThan(0);
  });

  it('renders status badges', () => {
    render(<TodosTableComponent todos={mockTodos} />);
    // Status appears in both mobile and desktop views
    expect(screen.getAllByText('Pending').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Completed').length).toBeGreaterThan(0);
  });

  it('shows Author header and names when showAuthor is true', () => {
    render(<TodosTableComponent todos={mockTodos} showAuthor />);
    expect(screen.getByText('Author')).toBeInTheDocument();
    expect(screen.getAllByText('Alice').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Bob').length).toBeGreaterThan(0);
  });

  it('hides Author header and names when showAuthor is false', () => {
    render(<TodosTableComponent todos={mockTodos} />);
    expect(screen.queryByText('Author')).not.toBeInTheDocument();
  });

  it('renders description when present', () => {
    render(<TodosTableComponent todos={mockTodos} />);
    expect(screen.getByText('Description 1')).toBeInTheDocument();
  });

  it('handles empty todos array', () => {
    const { container } = render(<TodosTableComponent todos={[]} />);
    // Table header row exists but no data rows
    const tbody = container.querySelector('tbody');
    expect(tbody?.querySelectorAll('tr').length).toBe(0);
  });
});
