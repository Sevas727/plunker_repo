import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AppLogo from '@/app/ui/app-logo';

vi.mock('next/image', () => ({
  default: ({ src, alt, width, height, ...props }: any) => (
    <img src={src} alt={alt} width={width} height={height} {...props} />
  ),
}));

describe('AppLogo', () => {
  it('renders an image with alt "VF"', () => {
    render(<AppLogo />);
    expect(screen.getByAltText('VF')).toBeInTheDocument();
  });

  it('uses /logo-navbar.png as source', () => {
    render(<AppLogo />);
    expect(screen.getByAltText('VF')).toHaveAttribute('src', '/logo-navbar.png');
  });

  it('has correct dimensions', () => {
    render(<AppLogo />);
    const img = screen.getByAltText('VF');
    expect(img).toHaveAttribute('width', '69');
    expect(img).toHaveAttribute('height', '32');
  });

  it('has h-8 w-auto class for responsive sizing', () => {
    render(<AppLogo />);
    const img = screen.getByAltText('VF');
    expect(img.className).toContain('h-8');
    expect(img.className).toContain('w-auto');
  });
});
