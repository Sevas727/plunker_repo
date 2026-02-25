import { lusitana } from '@/app/ui/fonts';
import Link from 'next/link';
import { getAllProjects } from '@/app/lib/mdx';
import ProjectCard from '@/app/ui/project-card';

export default function Page() {
  const projects = getAllProjects();

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      {/* Hero */}
      <section className="mb-20">
        <p className="mb-3 animate-fade-in text-sm font-medium tracking-wider text-cyan-400">
          FULL-STACK DEVELOPER
        </p>
        <h1
          className={`${lusitana.className} mb-5 animate-slide-up text-4xl font-bold leading-tight opacity-0 [animation-delay:100ms] md:text-5xl lg:text-6xl`}
        >
          <span className="text-gradient">Fedotov Vsevolod</span>
        </h1>
        <p className="mb-8 max-w-2xl animate-slide-up text-lg leading-relaxed text-gray-400 opacity-0 [animation-delay:200ms]">
          Building scalable web &amp; mobile applications with React, Next.js, TypeScript, Node.js,
          and cloud infrastructure. Focused on performance, testing, and clean architecture.
        </p>
        <div className="flex animate-slide-up flex-wrap gap-3 opacity-0 [animation-delay:300ms]">
          <Link
            href="/contacts"
            className="rounded-lg bg-accent px-6 py-3 text-sm font-medium text-white shadow-lg shadow-accent/20 transition-all hover:shadow-xl hover:shadow-accent/30"
          >
            Contact Me
          </Link>
          <Link
            href="/todos"
            className="rounded-lg border border-white/10 px-6 py-3 text-sm font-medium text-gray-300 transition-all hover:border-white/20 hover:bg-white/5"
          >
            View Todo Demo
          </Link>
        </div>
      </section>

      {/* Projects */}
      <section id="projects">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="mb-1 text-sm font-medium tracking-wider text-cyan-400">PORTFOLIO</p>
            <h2 className={`${lusitana.className} text-3xl font-bold`}>Projects</h2>
          </div>
          <span className="text-sm text-white/40">{projects.length} projects</span>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </section>
    </main>
  );
}
