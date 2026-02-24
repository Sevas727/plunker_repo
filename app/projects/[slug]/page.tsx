import { notFound } from 'next/navigation';
import Link from 'next/link';
import { lusitana } from '@/app/ui/fonts';
import { getProjectBySlug, getAllProjectSlugs } from '@/app/lib/mdx';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export async function generateStaticParams() {
  const slugs = getAllProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const project = getProjectBySlug(params.slug);
  if (!project) return { title: 'Not Found' };
  return { title: project.meta.title };
}

export default async function ProjectPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const project = getProjectBySlug(params.slug);

  if (!project) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link
        href="/#projects"
        className="mb-8 inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-500"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back to all projects
      </Link>

      <h1 className={`${lusitana.className} mb-4 text-4xl font-bold`}>{project.meta.title}</h1>

      <div className="mb-6 flex flex-wrap gap-2">
        {project.meta.tags.map((tag) => (
          <span key={tag} className="rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-700">
            {tag}
          </span>
        ))}
      </div>

      <div className="mb-8 flex gap-4">
        {project.meta.github && (
          <a
            href={project.meta.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline"
          >
            GitHub
          </a>
        )}
        {project.meta.live && (
          <a
            href={project.meta.live}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline"
          >
            Live Demo
          </a>
        )}
      </div>

      <article className="prose prose-gray max-w-none">
        <MDXRemote source={project.content} />
      </article>
    </main>
  );
}
