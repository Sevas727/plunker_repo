import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CardWrapper from '@/app/ui/dashboard/cards';

vi.mock('@/app/ui/fonts', () => ({ lusitana: { className: 'lusitana' } }));

describe('CardWrapper', () => {
  it('renders three cards with correct titles', () => {
    render(<CardWrapper totalTodos={10} pendingTodos={4} completedTodos={6} />);
    expect(screen.getByText('Total Todos')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('displays correct values', () => {
    render(<CardWrapper totalTodos={10} pendingTodos={4} completedTodos={6} />);
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
  });

  it('handles zero values', () => {
    render(<CardWrapper totalTodos={0} pendingTodos={0} completedTodos={0} />);
    const zeros = screen.getAllByText('0');
    expect(zeros).toHaveLength(3);
  });

  it('renders icons for each card type', () => {
    const { container } = render(
      <CardWrapper totalTodos={5} pendingTodos={2} completedTodos={3} />,
    );
    // Each card has an icon SVG
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBe(3);
  });

  it('applies lusitana font class to value text', () => {
    const { container } = render(
      <CardWrapper totalTodos={5} pendingTodos={2} completedTodos={3} />,
    );
    const values = container.querySelectorAll('.lusitana');
    expect(values.length).toBe(3);
  });
});
