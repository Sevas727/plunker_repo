import { describe, it, expect } from 'vitest';
import { formatDateToLocal, generatePagination } from '@/app/lib/utils';

describe('formatDateToLocal', () => {
  it('formats a valid ISO date string to en-US locale', () => {
    expect(formatDateToLocal('2023-11-15')).toBe('Nov 15, 2023');
  });

  it('formats with explicit locale', () => {
    const result = formatDateToLocal('2023-11-15', 'de-DE');
    expect(result).toBe('15. Nov. 2023');
  });

  it('handles datetime strings with time component', () => {
    expect(formatDateToLocal('2023-11-15T10:30:00Z')).toBe('Nov 15, 2023');
  });

  it('defaults to en-US locale', () => {
    const result = formatDateToLocal('2024-01-01');
    expect(result).toBe('Jan 1, 2024');
  });
});

describe('generatePagination', () => {
  it('returns all pages when totalPages <= 7', () => {
    expect(generatePagination(1, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(generatePagination(1, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('handles totalPages = 1', () => {
    expect(generatePagination(1, 1)).toEqual([1]);
  });

  it('returns first pages with ellipsis when currentPage <= 3', () => {
    expect(generatePagination(1, 10)).toEqual([1, 2, 3, '...', 9, 10]);
    expect(generatePagination(3, 10)).toEqual([1, 2, 3, '...', 9, 10]);
  });

  it('returns last pages with ellipsis when currentPage >= totalPages - 2', () => {
    expect(generatePagination(8, 10)).toEqual([1, 2, '...', 8, 9, 10]);
    expect(generatePagination(10, 10)).toEqual([1, 2, '...', 8, 9, 10]);
  });

  it('returns middle pages with ellipses on both sides', () => {
    expect(generatePagination(5, 10)).toEqual([1, '...', 4, 5, 6, '...', 10]);
  });

  it('handles boundary: currentPage = 4', () => {
    expect(generatePagination(4, 10)).toEqual([1, '...', 3, 4, 5, '...', 10]);
  });
});
