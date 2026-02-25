import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const projectsDirectory = path.join(process.cwd(), 'content/projects');

export type ProjectMeta = {
  title: string;
  slug: string;
  description: string;
  tags: string[];
  date: string;
  image?: string;
  images?: string[];
  video?: string;
  youtube?: string;
  github?: string;
  live?: string;
  steam?: string;
  appStore?: string;
  googlePlay?: string;
  order: number;
};

export function getAllProjects(): ProjectMeta[] {
  if (!fs.existsSync(projectsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(projectsDirectory);
  const projects = fileNames
    .filter((name) => name.endsWith('.mdx'))
    .map((fileName) => {
      const fullPath = path.join(projectsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data } = matter(fileContents);

      return {
        title: data.title || '',
        slug: data.slug || fileName.replace(/\.mdx$/, ''),
        description: data.description || '',
        tags: data.tags || [],
        date: data.date || '',
        image: data.image,
        images: data.images || [],
        video: data.video,
        youtube: data.youtube,
        github: data.github,
        live: data.live,
        steam: data.steam,
        appStore: data.appStore,
        googlePlay: data.googlePlay,
        order: data.order ?? 999,
      } as ProjectMeta;
    });

  return projects.sort((a, b) => a.order - b.order);
}

export function getProjectBySlug(slug: string): { meta: ProjectMeta; content: string } | null {
  const fullPath = path.join(projectsDirectory, `${slug}.mdx`);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  return {
    meta: {
      title: data.title || '',
      slug: data.slug || slug,
      description: data.description || '',
      tags: data.tags || [],
      date: data.date || '',
      image: data.image,
      images: data.images || [],
      video: data.video,
      youtube: data.youtube,
      github: data.github,
      live: data.live,
      steam: data.steam,
      appStore: data.appStore,
      googlePlay: data.googlePlay,
      order: data.order ?? 999,
    },
    content,
  };
}

export function getAllProjectSlugs(): string[] {
  if (!fs.existsSync(projectsDirectory)) {
    return [];
  }

  return fs
    .readdirSync(projectsDirectory)
    .filter((name) => name.endsWith('.mdx'))
    .map((name) => name.replace(/\.mdx$/, ''));
}
