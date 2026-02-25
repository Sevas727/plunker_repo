import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import ParticleField from '@/app/ui/particle-field';

const mockGetContext = vi.fn();
const mockMatchMedia = vi.fn();
const mockRAF = vi.fn();
const mockCAF = vi.fn();

beforeEach(() => {
  mockGetContext.mockReturnValue({
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    fillRect: vi.fn(),
    createRadialGradient: vi.fn(() => ({
      addColorStop: vi.fn(),
    })),
    setTransform: vi.fn(),
    set strokeStyle(_v: string) {},
    set fillStyle(_v: string) {},
    set lineWidth(_v: number) {},
  });

  HTMLCanvasElement.prototype.getContext = mockGetContext as any;

  mockMatchMedia.mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });
  window.matchMedia = mockMatchMedia;

  mockRAF.mockReturnValue(1);
  window.requestAnimationFrame = mockRAF;

  mockCAF.mockImplementation(() => {});
  window.cancelAnimationFrame = mockCAF;
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('ParticleField', () => {
  it('renders a canvas element', () => {
    const { container } = render(<ParticleField />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('has aria-hidden="true" on canvas', () => {
    const { container } = render(<ParticleField />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toHaveAttribute('aria-hidden', 'true');
  });

  it('has pointer-events-none class', () => {
    const { container } = render(<ParticleField />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toHaveClass('pointer-events-none');
  });

  it('has fixed positioning class', () => {
    const { container } = render(<ParticleField />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toHaveClass('fixed');
  });

  it('has -z-10 z-index class', () => {
    const { container } = render(<ParticleField />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toHaveClass('-z-10');
  });

  it('has inset-0 class for full coverage', () => {
    const { container } = render(<ParticleField />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toHaveClass('inset-0');
  });

  it('starts animation (calls requestAnimationFrame) when motion is allowed', () => {
    render(<ParticleField />);
    expect(mockRAF).toHaveBeenCalled();
  });

  it('does not initialize canvas when prefers-reduced-motion is set', () => {
    mockMatchMedia.mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    // Clear any calls from previous tests
    mockGetContext.mockClear();

    render(<ParticleField />);
    // When reduced motion is preferred, getContext is never called
    expect(mockGetContext).not.toHaveBeenCalled();
  });

  it('cancels animation frame on unmount', () => {
    const { unmount } = render(<ParticleField />);
    unmount();
    expect(mockCAF).toHaveBeenCalled();
  });

  it('gets 2d context from canvas', () => {
    render(<ParticleField />);
    expect(mockGetContext).toHaveBeenCalledWith('2d', { alpha: true });
  });
});
