import { lusitana } from '@/app/ui/fonts';
import Link from 'next/link';
import { getAllProjects } from '@/app/lib/mdx';

export default function Page() {
  const projects = getAllProjects();

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <section className="mb-16">
        <h1 className={`${lusitana.className} mb-4 text-4xl font-bold md:text-5xl`}>
          Fedotov Vsevolod
        </h1>
        <p className="mb-6 max-w-2xl text-lg text-gray-600">
          Full-stack developer with experience in React, Next.js, TypeScript, Node.js, and cloud
          infrastructure. Passionate about building scalable web applications and learning new
          technologies.
        </p>
        <div className="flex gap-4">
          <Link
            href="/contacts"
            className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-500"
          >
            Contact Me
          </Link>
          <Link
            href="/todos"
            className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            View Todo Demo
          </Link>
        </div>
      </section>

      <section id="projects">
        <h2 className={`${lusitana.className} mb-8 text-3xl font-bold`}>Projects</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {projects.map((project) => (
            <Link
              key={project.slug}
              href={`/projects/${project.slug}`}
              className="group rounded-lg border border-gray-200 p-6 transition-all hover:border-blue-300 hover:shadow-md"
            >
              <h3 className="mb-2 text-xl font-semibold group-hover:text-blue-600">
                {project.title}
              </h3>
              <p className="mb-4 text-sm text-gray-600">{project.description}</p>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
