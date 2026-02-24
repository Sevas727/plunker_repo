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
  createTodo: vi.fn(),
  updateTodo: vi.fn(),
  deleteTodo: Object.assign(vi.fn(), { bind: vi.fn(() => vi.fn()) }),
}));
vi.mock('@/app/lib/db', () => ({ default: vi.fn() }));
vi.mock('@/auth', () => ({ auth: vi.fn(), signIn: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('next/navigation', () => ({ redirect: vi.fn() }));
vi.mock('@/app/lib/data', () => ({ fetchTodoOwnerId: vi.fn() }));

const { CreateTodo, UpdateTodo, DeleteTodo } = await import('@/app/ui/todos/buttons');

describe('CreateTodo', () => {
  it('renders a link to /todos/create', () => {
    render(<CreateTodo />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/todos/create');
  });

  it('shows "Create Todo" text', () => {
    render(<CreateTodo />);
    expect(screen.getByText('Create Todo')).toBeInTheDocument();
  });
});

describe('UpdateTodo', () => {
  it('renders a link to /todos/{id}/edit', () => {
    render(<UpdateTodo id="abc-123" />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/todos/abc-123/edit');
  });
});

describe('DeleteTodo', () => {
  it('renders a form with delete button', () => {
    render(<DeleteTodo id="abc-123" />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('has accessible "Delete" label', () => {
    render(<DeleteTodo id="abc-123" />);
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('button is of type submit', () => {
    render(<DeleteTodo id="abc-123" />);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });
});
