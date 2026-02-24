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
