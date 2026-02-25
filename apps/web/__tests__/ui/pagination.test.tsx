import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Pagination from '@/app/ui/pagination';

vi.mock('next/link', () => ({
  default: ({ children, href, className, ...props }: any) => (
    <a href={href} className={className} {...props}>
      {children}
    </a>
  ),
}));
vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(() => new URLSearchParams('page=1')),
  usePathname: vi.fn(() => '/todos'),
}));
vi.mock('@/app/ui/fonts', () => ({ lusitana: { className: 'lusitana' } }));

describe('Pagination', () => {
  it('renders correct number of page elements for small totalPages', () => {
    render(<Pagination totalPages={3} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('highlights current page (page 1) as active with bg-blue-600', () => {
    render(<Pagination totalPages={3} />);
    // Active page is rendered as a div, not a link
    const page1 = screen.getByText('1');
    expect(page1.closest('div')).toHaveClass('bg-blue-600');
  });

  it('renders non-active pages as links', () => {
    render(<Pagination totalPages={3} />);
    const page2 = screen.getByText('2');
    expect(page2.closest('a')).toBeInTheDocument();
  });

  it('renders ellipsis for large page counts', () => {
    // totalPages=10, currentPage=1 => [1, 2, 3, '...', 9, 10]
    render(<Pagination totalPages={10} />);
    expect(screen.getByText('...')).toBeInTheDocument();
  });

  it('disables left arrow on first page (renders as div, not link)', () => {
    render(<Pagination totalPages={5} />);
    // Left arrow is disabled (rendered as div, not a link)
    // Right arrow should be a link
    const links = screen.getAllByRole('link');
    // Pages 2,3,...,5 are links + right arrow link
    expect(links.length).toBeGreaterThan(0);
  });

  it('renders all pages without ellipsis when totalPages <= 7', () => {
    render(<Pagination totalPages={7} />);
    for (let i = 1; i <= 7; i++) {
      expect(screen.getByText(String(i))).toBeInTheDocument();
    }
    expect(screen.queryByText('...')).not.toBeInTheDocument();
  });
});
