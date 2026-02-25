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
  updateTodo: Object.assign(vi.fn(), { bind: vi.fn(() => vi.fn()) }),
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

const { default: EditTodoForm } = await import('@/app/ui/todos/edit-form');
const React = await import('react');

const pendingTodo = {
  id: '1',
  title: 'Test Todo',
  description: 'Test description',
  status: 'pending' as const,
};

const completedTodo = {
  id: '2',
  title: 'Done Todo',
  description: 'Finished task',
  status: 'completed' as const,
};

describe('EditTodoForm', () => {
  beforeEach(() => {
    mockState = { message: '', errors: {} };
    vi.mocked(React.useActionState).mockImplementation(() => [mockState, mockFormAction, false]);
  });

  it('pre-fills title from todo prop', () => {
    render(<EditTodoForm todo={pendingTodo} />);
    expect(screen.getByLabelText('Title')).toHaveValue('Test Todo');
  });

  it('pre-fills description from todo prop', () => {
    render(<EditTodoForm todo={pendingTodo} />);
    expect(screen.getByLabelText('Description')).toHaveValue('Test description');
  });

  it('pre-selects pending status radio when todo is pending', () => {
    render(<EditTodoForm todo={pendingTodo} />);
    expect(screen.getByLabelText('Pending')).toBeChecked();
    expect(screen.getByLabelText('Completed')).not.toBeChecked();
  });

  it('pre-selects completed status radio when todo is completed', () => {
    render(<EditTodoForm todo={completedTodo} />);
    expect(screen.getByLabelText('Completed')).toBeChecked();
    expect(screen.getByLabelText('Pending')).not.toBeChecked();
  });

  it('renders both status radio options', () => {
    render(<EditTodoForm todo={pendingTodo} />);
    expect(screen.getByLabelText('Pending')).toBeInTheDocument();
    expect(screen.getByLabelText('Completed')).toBeInTheDocument();
  });

  it('renders Status fieldset legend', () => {
    render(<EditTodoForm todo={pendingTodo} />);
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('renders submit button with "Update Todo"', () => {
    render(<EditTodoForm todo={pendingTodo} />);
    expect(screen.getByRole('button', { name: 'Update Todo' })).toBeInTheDocument();
  });

  it('renders cancel link to /todos', () => {
    render(<EditTodoForm todo={pendingTodo} />);
    const cancelLink = screen.getByText('Cancel');
    expect(cancelLink.closest('a')).toHaveAttribute('href', '/todos');
  });
});
