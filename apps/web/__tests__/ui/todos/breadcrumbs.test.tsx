import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Breadcrumbs from '@/app/ui/todos/breadcrumbs';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));
vi.mock('@/app/ui/fonts', () => ({ lusitana: { className: 'lusitana' } }));

describe('Breadcrumbs', () => {
  const breadcrumbs = [
    { label: 'Todos', href: '/todos' },
    { label: 'Create', href: '/todos/create', active: true },
  ];

  it('renders all breadcrumb labels', () => {
    render(<Breadcrumbs breadcrumbs={breadcrumbs} />);
    expect(screen.getByText('Todos')).toBeInTheDocument();
    expect(screen.getByText('Create')).toBeInTheDocument();
  });

  it('renders separator between breadcrumbs', () => {
    render(<Breadcrumbs breadcrumbs={breadcrumbs} />);
    expect(screen.getByText('/')).toBeInTheDocument();
  });

  it('does not render separator after last breadcrumb', () => {
    render(<Breadcrumbs breadcrumbs={breadcrumbs} />);
    const separators = screen.getAllByText('/');
    expect(separators).toHaveLength(1);
  });

  it('applies active styling to active breadcrumb', () => {
    render(<Breadcrumbs breadcrumbs={breadcrumbs} />);
    const activeLi = screen.getByText('Create').closest('li');
    expect(activeLi).toHaveClass('text-white');
  });

  it('applies inactive styling to non-active breadcrumb', () => {
    render(<Breadcrumbs breadcrumbs={breadcrumbs} />);
    const inactiveLi = screen.getByText('Todos').closest('li');
    expect(inactiveLi).toHaveClass('text-white/40');
  });

  it('has correct link hrefs', () => {
    render(<Breadcrumbs breadcrumbs={breadcrumbs} />);
    expect(screen.getByText('Todos').closest('a')).toHaveAttribute('href', '/todos');
    expect(screen.getByText('Create').closest('a')).toHaveAttribute('href', '/todos/create');
  });

  it('has aria-label on nav', () => {
    render(<Breadcrumbs breadcrumbs={breadcrumbs} />);
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
  });

  it('sets aria-current on active breadcrumb', () => {
    render(<Breadcrumbs breadcrumbs={breadcrumbs} />);
    const activeLi = screen.getByText('Create').closest('li');
    expect(activeLi).toHaveAttribute('aria-current', 'true');
  });
});
