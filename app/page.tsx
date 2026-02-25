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
        <p className="mb-4 max-w-2xl animate-slide-up text-lg leading-relaxed text-gray-400 opacity-0 [animation-delay:200ms]">
          Building scalable web &amp; mobile applications with React, Next.js, Vue.js, TypeScript,
          Node.js, and cloud infrastructure. Focused on performance, testing, and clean
          architecture.
        </p>
        <a
          href="https://github.com/Sevas727/plunker_repo"
          target="_blank"
          rel="noopener noreferrer"
          className="mb-8 inline-flex animate-slide-up items-center gap-2 text-sm text-white/40 opacity-0 transition-colors hover:text-white/80 [animation-delay:250ms]"
        >
          <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
          github.com/Sevas727/plunker_repo
        </a>
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
