import { describe, it, expect, vi, beforeEach } from 'vitest';
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
  TodoState: {},
}));
vi.mock('@/app/lib/db', () => ({ default: vi.fn() }));
vi.mock('@/auth', () => ({ auth: vi.fn(), signIn: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('next/navigation', () => ({ redirect: vi.fn() }));
vi.mock('@/app/lib/data', () => ({ fetchTodoOwnerId: vi.fn() }));

let mockState = { message: '', errors: {} };
const mockFormAction = vi.fn();

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    useActionState: vi.fn(() => [mockState, mockFormAction, false]),
  };
});

const { default: CreateTodoForm } = await import('@/app/ui/todos/create-form');
const React = await import('react');

describe('CreateTodoForm', () => {
  beforeEach(() => {
    mockState = { message: '', errors: {} };
    vi.mocked(React.useActionState).mockImplementation(() => [mockState, mockFormAction, false]);
  });

  it('renders title input', () => {
    render(<CreateTodoForm />);
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
  });

  it('renders description textarea', () => {
    render(<CreateTodoForm />);
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
  });

  it('has placeholder text for title input', () => {
    render(<CreateTodoForm />);
    expect(screen.getByPlaceholderText('Enter todo title')).toBeInTheDocument();
  });

  it('renders submit button with "Create Todo"', () => {
    render(<CreateTodoForm />);
    expect(screen.getByRole('button', { name: 'Create Todo' })).toBeInTheDocument();
  });

  it('renders cancel link to /todos', () => {
    render(<CreateTodoForm />);
    const cancelLink = screen.getByText('Cancel');
    expect(cancelLink.closest('a')).toHaveAttribute('href', '/todos');
  });

  it('title input is required', () => {
    render(<CreateTodoForm />);
    expect(screen.getByLabelText('Title')).toBeRequired();
  });

  it('displays title error when state has errors', () => {
    mockState = { message: 'Missing Fields.', errors: { title: ['Title is required.'] } };
    vi.mocked(React.useActionState).mockImplementation(() => [mockState, mockFormAction, false]);
    render(<CreateTodoForm />);
    expect(screen.getByText('Title is required.')).toBeInTheDocument();
  });

  it('displays general error message', () => {
    mockState = { message: 'Something went wrong.', errors: {} };
    vi.mocked(React.useActionState).mockImplementation(() => [mockState, mockFormAction, false]);
    render(<CreateTodoForm />);
    expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
  });
});
