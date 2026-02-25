import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ImageGallery from '@/app/ui/image-gallery';

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}));

vi.mock('@heroicons/react/24/outline', () => ({
  ChevronLeftIcon: (props: any) => <svg data-testid="chevron-left" {...props} />,
  ChevronRightIcon: (props: any) => <svg data-testid="chevron-right" {...props} />,
  XMarkIcon: (props: any) => <svg data-testid="x-mark" {...props} />,
}));

const images = [
  '/projects/hoglands/01.jpg',
  '/projects/hoglands/02.jpg',
  '/projects/hoglands/03.jpg',
];

describe('ImageGallery', () => {
  it('returns null for empty images array', () => {
    const { container } = render(<ImageGallery images={[]} alt="Test" />);
    expect(container.innerHTML).toBe('');
  });

  it('renders thumbnail buttons for each image', () => {
    render(<ImageGallery images={images} alt="Hoglands" />);
    const buttons = screen.getAllByRole('button', { name: /View Hoglands screenshot/ });
    expect(buttons).toHaveLength(3);
  });

  it('renders images with correct alt text', () => {
    render(<ImageGallery images={images} alt="Hoglands" />);
    expect(screen.getByAltText('Hoglands screenshot 1')).toBeInTheDocument();
    expect(screen.getByAltText('Hoglands screenshot 2')).toBeInTheDocument();
    expect(screen.getByAltText('Hoglands screenshot 3')).toBeInTheDocument();
  });

  it('does not show lightbox by default', () => {
    render(<ImageGallery images={images} alt="Hoglands" />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens lightbox when thumbnail is clicked', async () => {
    const user = userEvent.setup();
    render(<ImageGallery images={images} alt="Hoglands" />);

    await user.click(screen.getByLabelText('View Hoglands screenshot 2'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
  });

  it('closes lightbox when close button is clicked', async () => {
    const user = userEvent.setup();
    render(<ImageGallery images={images} alt="Hoglands" />);

    await user.click(screen.getByLabelText('View Hoglands screenshot 1'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.click(screen.getByLabelText('Close gallery'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('navigates to next image', async () => {
    const user = userEvent.setup();
    render(<ImageGallery images={images} alt="Hoglands" />);

    await user.click(screen.getByLabelText('View Hoglands screenshot 1'));
    expect(screen.getByText('1 / 3')).toBeInTheDocument();

    await user.click(screen.getByLabelText('Next image'));
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
  });

  it('navigates to previous image', async () => {
    const user = userEvent.setup();
    render(<ImageGallery images={images} alt="Hoglands" />);

    await user.click(screen.getByLabelText('View Hoglands screenshot 2'));
    expect(screen.getByText('2 / 3')).toBeInTheDocument();

    await user.click(screen.getByLabelText('Previous image'));
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });

  it('wraps around from last to first image (next)', async () => {
    const user = userEvent.setup();
    render(<ImageGallery images={images} alt="Hoglands" />);

    await user.click(screen.getByLabelText('View Hoglands screenshot 3'));
    expect(screen.getByText('3 / 3')).toBeInTheDocument();

    await user.click(screen.getByLabelText('Next image'));
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });

  it('wraps around from first to last image (previous)', async () => {
    const user = userEvent.setup();
    render(<ImageGallery images={images} alt="Hoglands" />);

    await user.click(screen.getByLabelText('View Hoglands screenshot 1'));
    expect(screen.getByText('1 / 3')).toBeInTheDocument();

    await user.click(screen.getByLabelText('Previous image'));
    expect(screen.getByText('3 / 3')).toBeInTheDocument();
  });

  it('does not show prev/next buttons for single image', async () => {
    const user = userEvent.setup();
    render(<ImageGallery images={['/projects/single.jpg']} alt="Single" />);

    await user.click(screen.getByLabelText('View Single screenshot 1'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.queryByLabelText('Previous image')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Next image')).not.toBeInTheDocument();
    expect(screen.getByText('1 / 1')).toBeInTheDocument();
  });
});
