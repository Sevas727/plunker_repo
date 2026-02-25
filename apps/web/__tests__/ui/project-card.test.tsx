import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProjectCard from '@/app/ui/project-card';
import type { ProjectMeta } from '@/app/lib/mdx';

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}));
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const baseProject: ProjectMeta = {
  title: 'Test Project',
  slug: 'test-project',
  description: 'A test project description for unit testing purposes.',
  tags: ['React', 'TypeScript'],
  date: '2024-06-15',
  order: 1,
};

describe('ProjectCard', () => {
  it('renders project title', () => {
    render(<ProjectCard project={baseProject} />);
    expect(screen.getByText('Test Project')).toBeInTheDocument();
  });

  it('renders project description', () => {
    render(<ProjectCard project={baseProject} />);
    expect(
      screen.getByText('A test project description for unit testing purposes.'),
    ).toBeInTheDocument();
  });

  it('renders year badge from date', () => {
    render(<ProjectCard project={baseProject} />);
    expect(screen.getByText('2024')).toBeInTheDocument();
  });

  it('renders tags', () => {
    render(<ProjectCard project={baseProject} />);
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });

  it('renders only first 4 tags and overflow badge', () => {
    const project: ProjectMeta = {
      ...baseProject,
      tags: ['React', 'TypeScript', 'Next.js', 'Node.js', 'GraphQL', 'Docker'],
    };
    render(<ProjectCard project={project} />);
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Next.js')).toBeInTheDocument();
    expect(screen.getByText('Node.js')).toBeInTheDocument();
    expect(screen.queryByText('GraphQL')).not.toBeInTheDocument();
    expect(screen.queryByText('Docker')).not.toBeInTheDocument();
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('renders stretched link to project page', () => {
    render(<ProjectCard project={baseProject} />);
    const link = screen.getByRole('link', { name: 'Test Project' });
    expect(link).toHaveAttribute('href', '/projects/test-project');
  });

  it('renders Image when image field is provided', () => {
    const project: ProjectMeta = {
      ...baseProject,
      image: '/projects/test/card.webp',
    };
    render(<ProjectCard project={project} />);
    const img = screen.getByAltText('Test Project');
    expect(img).toHaveAttribute('src', '/projects/test/card.webp');
  });

  it('renders placeholder initial when no image and no youtube', () => {
    render(<ProjectCard project={baseProject} />);
    expect(screen.getByText('T')).toBeInTheDocument();
  });

  it('renders YouTube iframe when youtube field is provided', () => {
    const project: ProjectMeta = {
      ...baseProject,
      youtube: 'https://www.youtube.com/watch?v=Qz9TE3hfl70',
    };
    const { container } = render(<ProjectCard project={project} />);
    const iframe = container.querySelector('iframe');
    expect(iframe).toBeInTheDocument();
    expect(iframe!.src).toContain('youtube.com/embed/Qz9TE3hfl70');
    expect(iframe!.src).toContain('autoplay=1');
    expect(iframe!.src).toContain('mute=1');
    expect(iframe!.src).toContain('loop=1');
    expect(iframe!.src).toContain('controls=0');
  });

  it('renders YouTube iframe for youtu.be short URL', () => {
    const project: ProjectMeta = {
      ...baseProject,
      youtube: 'https://youtu.be/abc123',
    };
    const { container } = render(<ProjectCard project={project} />);
    const iframe = container.querySelector('iframe');
    expect(iframe).toBeInTheDocument();
    expect(iframe!.src).toContain('youtube.com/embed/abc123');
  });

  it('renders YouTube iframe for embed URL', () => {
    const project: ProjectMeta = {
      ...baseProject,
      youtube: 'https://www.youtube.com/embed/def456',
    };
    const { container } = render(<ProjectCard project={project} />);
    const iframe = container.querySelector('iframe');
    expect(iframe!.src).toContain('youtube.com/embed/def456');
  });

  it('falls back to image when youtube URL is invalid', () => {
    const project: ProjectMeta = {
      ...baseProject,
      youtube: 'https://example.com/not-youtube',
      image: '/projects/test/card.webp',
    };
    const { container } = render(<ProjectCard project={project} />);
    expect(container.querySelector('iframe')).not.toBeInTheDocument();
    expect(screen.getByAltText('Test Project')).toBeInTheDocument();
  });

  it('renders GitHub link when github field is provided', () => {
    const project: ProjectMeta = {
      ...baseProject,
      github: 'https://github.com/user/repo',
    };
    render(<ProjectCard project={project} />);
    const link = screen.getByLabelText('Test Project on GitHub');
    expect(link).toHaveAttribute('href', 'https://github.com/user/repo');
    expect(link).toHaveAttribute('target', '_blank');
    expect(screen.getByText('GitHub')).toBeInTheDocument();
  });

  it('renders Steam link when steam field is provided', () => {
    const project: ProjectMeta = {
      ...baseProject,
      steam: 'https://store.steampowered.com/app/123/Game/',
    };
    render(<ProjectCard project={project} />);
    const link = screen.getByLabelText('Test Project on Steam');
    expect(link).toHaveAttribute('href', 'https://store.steampowered.com/app/123/Game/');
    expect(screen.getByText('Steam')).toBeInTheDocument();
  });

  it('renders App Store link when appStore field is provided', () => {
    const project: ProjectMeta = {
      ...baseProject,
      appStore: 'https://apps.apple.com/app/id123',
    };
    render(<ProjectCard project={project} />);
    const link = screen.getByLabelText('Test Project on App Store');
    expect(link).toHaveAttribute('href', 'https://apps.apple.com/app/id123');
    expect(screen.getByText('App Store')).toBeInTheDocument();
  });

  it('renders Google Play link when googlePlay field is provided', () => {
    const project: ProjectMeta = {
      ...baseProject,
      googlePlay: 'https://play.google.com/store/apps/details?id=com.example',
    };
    render(<ProjectCard project={project} />);
    const link = screen.getByLabelText('Test Project on Google Play');
    expect(link).toHaveAttribute(
      'href',
      'https://play.google.com/store/apps/details?id=com.example',
    );
    expect(screen.getByText('Google Play')).toBeInTheDocument();
  });

  it('does not render links row when no external links', () => {
    const { container } = render(<ProjectCard project={baseProject} />);
    expect(screen.queryByText('GitHub')).not.toBeInTheDocument();
    expect(screen.queryByText('Steam')).not.toBeInTheDocument();
    expect(screen.queryByText('App Store')).not.toBeInTheDocument();
    expect(screen.queryByText('Google Play')).not.toBeInTheDocument();
    // No border-t links section
    expect(container.querySelector('.border-t')).not.toBeInTheDocument();
  });

  it('renders multiple external links together', () => {
    const project: ProjectMeta = {
      ...baseProject,
      github: 'https://github.com/user/repo',
      steam: 'https://store.steampowered.com/app/123/',
      googlePlay: 'https://play.google.com/store/apps/details?id=com.test',
    };
    render(<ProjectCard project={project} />);
    expect(screen.getByText('GitHub')).toBeInTheDocument();
    expect(screen.getByText('Steam')).toBeInTheDocument();
    expect(screen.getByText('Google Play')).toBeInTheDocument();
  });
});
