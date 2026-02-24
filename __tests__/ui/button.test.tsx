import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '@/app/ui/button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('applies base styling classes', () => {
    render(<Button>Test</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-blue-500');
  });

  it('merges custom className', () => {
    render(<Button className="w-full">Test</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-blue-500');
    expect(button).toHaveClass('w-full');
  });

  it('passes through HTML button attributes', () => {
    render(
      <Button type="submit" disabled>
        Test
      </Button>,
    );
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'submit');
    expect(button).toBeDisabled();
  });
});
