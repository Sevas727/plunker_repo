import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAllProjects, getProjectBySlug, getAllProjectSlugs } from '@/app/lib/mdx';

const mockExistsSync = vi.fn();
const mockReaddirSync = vi.fn();
const mockReadFileSync = vi.fn();

vi.mock('fs', () => ({
  default: {
    existsSync: (...args: unknown[]) => mockExistsSync(...args),
    readdirSync: (...args: unknown[]) => mockReaddirSync(...args),
    readFileSync: (...args: unknown[]) => mockReadFileSync(...args),
  },
  existsSync: (...args: unknown[]) => mockExistsSync(...args),
  readdirSync: (...args: unknown[]) => mockReaddirSync(...args),
  readFileSync: (...args: unknown[]) => mockReadFileSync(...args),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getAllProjects', () => {
  it('returns empty array when projects directory does not exist', () => {
    mockExistsSync.mockReturnValue(false);
    expect(getAllProjects()).toEqual([]);
  });

  it('returns sorted projects from MDX files', () => {
    mockExistsSync.mockReturnValue(true);
    mockReaddirSync.mockReturnValue(['project-a.mdx', 'project-b.mdx']);
    mockReadFileSync
      .mockReturnValueOnce('---\ntitle: Project A\norder: 2\n---\nContent A')
      .mockReturnValueOnce('---\ntitle: Project B\norder: 1\n---\nContent B');

    const projects = getAllProjects();
    expect(projects).toHaveLength(2);
    expect(projects[0].title).toBe('Project B');
    expect(projects[0].order).toBe(1);
    expect(projects[1].title).toBe('Project A');
    expect(projects[1].order).toBe(2);
  });

  it('ignores non-mdx files', () => {
    mockExistsSync.mockReturnValue(true);
    mockReaddirSync.mockReturnValue(['readme.txt', 'project.mdx']);
    mockReadFileSync.mockReturnValue('---\ntitle: Project\norder: 1\n---\nContent');

    const projects = getAllProjects();
    expect(projects).toHaveLength(1);
  });

  it('uses filename as slug fallback when frontmatter has no slug', () => {
    mockExistsSync.mockReturnValue(true);
    mockReaddirSync.mockReturnValue(['my-project.mdx']);
    mockReadFileSync.mockReturnValue('---\ntitle: My Project\n---\nContent');

    const projects = getAllProjects();
    expect(projects[0].slug).toBe('my-project');
  });

  it('parses youtube field', () => {
    mockExistsSync.mockReturnValue(true);
    mockReaddirSync.mockReturnValue(['game.mdx']);
    mockReadFileSync.mockReturnValue(
      '---\ntitle: Game\nyoutube: https://www.youtube.com/watch?v=abc123\n---\nContent',
    );

    const projects = getAllProjects();
    expect(projects[0].youtube).toBe('https://www.youtube.com/watch?v=abc123');
  });

  it('parses steam field', () => {
    mockExistsSync.mockReturnValue(true);
    mockReaddirSync.mockReturnValue(['game.mdx']);
    mockReadFileSync.mockReturnValue(
      '---\ntitle: Game\nsteam: https://store.steampowered.com/app/123/Game/\n---\nContent',
    );

    const projects = getAllProjects();
    expect(projects[0].steam).toBe('https://store.steampowered.com/app/123/Game/');
  });

  it('parses appStore and googlePlay fields', () => {
    mockExistsSync.mockReturnValue(true);
    mockReaddirSync.mockReturnValue(['mobile-app.mdx']);
    mockReadFileSync.mockReturnValue(
      '---\ntitle: Mobile App\nappStore: https://apps.apple.com/app/id123\ngooglePlay: https://play.google.com/store/apps/details?id=com.example\n---\nContent',
    );

    const projects = getAllProjects();
    expect(projects[0].appStore).toBe('https://apps.apple.com/app/id123');
    expect(projects[0].googlePlay).toBe(
      'https://play.google.com/store/apps/details?id=com.example',
    );
  });

  it('parses images array', () => {
    mockExistsSync.mockReturnValue(true);
    mockReaddirSync.mockReturnValue(['project.mdx']);
    mockReadFileSync.mockReturnValue(
      '---\ntitle: Project\nimages:\n  - /img/01.jpg\n  - /img/02.jpg\n  - /img/03.jpg\n---\nContent',
    );

    const projects = getAllProjects();
    expect(projects[0].images).toEqual(['/img/01.jpg', '/img/02.jpg', '/img/03.jpg']);
  });

  it('parses video field', () => {
    mockExistsSync.mockReturnValue(true);
    mockReaddirSync.mockReturnValue(['project.mdx']);
    mockReadFileSync.mockReturnValue('---\ntitle: Project\nvideo: /videos/demo.mp4\n---\nContent');

    const projects = getAllProjects();
    expect(projects[0].video).toBe('/videos/demo.mp4');
  });

  it('returns undefined for missing optional fields', () => {
    mockExistsSync.mockReturnValue(true);
    mockReaddirSync.mockReturnValue(['minimal.mdx']);
    mockReadFileSync.mockReturnValue('---\ntitle: Minimal\n---\nContent');

    const projects = getAllProjects();
    expect(projects[0].youtube).toBeUndefined();
    expect(projects[0].steam).toBeUndefined();
    expect(projects[0].appStore).toBeUndefined();
    expect(projects[0].googlePlay).toBeUndefined();
    expect(projects[0].image).toBeUndefined();
    expect(projects[0].video).toBeUndefined();
    expect(projects[0].images).toEqual([]);
  });
});

describe('getProjectBySlug', () => {
  it('returns null when file does not exist', () => {
    mockExistsSync.mockReturnValue(false);
    expect(getProjectBySlug('nonexistent')).toBeNull();
  });

  it('returns meta and content for existing slug', () => {
    mockExistsSync.mockReturnValue(true);
    mockReadFileSync.mockReturnValue(
      '---\ntitle: Test Project\ndescription: A test\ntags:\n  - react\ndate: 2024-01-01\norder: 1\n---\n# Hello World',
    );

    const result = getProjectBySlug('test-project');
    expect(result).not.toBeNull();
    expect(result!.meta.title).toBe('Test Project');
    expect(result!.meta.description).toBe('A test');
    expect(result!.meta.tags).toEqual(['react']);
    expect(result!.content).toContain('# Hello World');
  });

  it('falls back to slug param when frontmatter has no slug', () => {
    mockExistsSync.mockReturnValue(true);
    mockReadFileSync.mockReturnValue('---\ntitle: No Slug\n---\nContent');

    const result = getProjectBySlug('my-slug');
    expect(result!.meta.slug).toBe('my-slug');
  });

  it('parses all new media fields', () => {
    mockExistsSync.mockReturnValue(true);
    mockReadFileSync.mockReturnValue(
      [
        '---',
        'title: Full Project',
        'youtube: https://youtu.be/xyz789',
        'steam: https://store.steampowered.com/app/456/',
        'appStore: https://apps.apple.com/app/id456',
        'googlePlay: https://play.google.com/store/apps/details?id=com.test',
        'video: /videos/trailer.mp4',
        'image: /projects/full/card.webp',
        'images:',
        '  - /projects/full/01.jpg',
        '  - /projects/full/02.jpg',
        '---',
        '# Full Project',
      ].join('\n'),
    );

    const result = getProjectBySlug('full-project');
    expect(result).not.toBeNull();
    expect(result!.meta.youtube).toBe('https://youtu.be/xyz789');
    expect(result!.meta.steam).toBe('https://store.steampowered.com/app/456/');
    expect(result!.meta.appStore).toBe('https://apps.apple.com/app/id456');
    expect(result!.meta.googlePlay).toBe('https://play.google.com/store/apps/details?id=com.test');
    expect(result!.meta.video).toBe('/videos/trailer.mp4');
    expect(result!.meta.image).toBe('/projects/full/card.webp');
    expect(result!.meta.images).toEqual(['/projects/full/01.jpg', '/projects/full/02.jpg']);
  });
});

describe('getAllProjectSlugs', () => {
  it('returns empty array when directory does not exist', () => {
    mockExistsSync.mockReturnValue(false);
    expect(getAllProjectSlugs()).toEqual([]);
  });

  it('returns slugs from filenames', () => {
    mockExistsSync.mockReturnValue(true);
    mockReaddirSync.mockReturnValue(['foo.mdx', 'bar.mdx', 'readme.txt']);

    expect(getAllProjectSlugs()).toEqual(['foo', 'bar']);
  });
});
