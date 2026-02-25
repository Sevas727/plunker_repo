import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TodoStatus from '@/app/ui/todos/status';

describe('TodoStatus', () => {
  it('renders "Pending" text for pending status', () => {
    render(<TodoStatus status="pending" />);
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('applies gray styling for pending', () => {
    const { container } = render(<TodoStatus status="pending" />);
    const span = container.querySelector('span');
    expect(span).toHaveClass('bg-white/10');
    expect(span).toHaveClass('text-white/40');
  });

  it('renders "Completed" text for completed status', () => {
    render(<TodoStatus status="completed" />);
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('applies green styling for completed', () => {
    const { container } = render(<TodoStatus status="completed" />);
    const span = container.querySelector('span');
    expect(span).toHaveClass('bg-green-500');
    expect(span).toHaveClass('text-white');
  });

  it('renders empty span for unknown status', () => {
    const { container } = render(<TodoStatus status="unknown" />);
    expect(screen.queryByText('Pending')).not.toBeInTheDocument();
    expect(screen.queryByText('Completed')).not.toBeInTheDocument();
    // The outer span is still rendered
    expect(container.querySelector('span')).toBeInTheDocument();
  });
});
