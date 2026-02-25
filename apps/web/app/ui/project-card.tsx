'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { ProjectMeta } from '@/app/lib/mdx';
import Badge from '@/app/ui/design-system/badge';

function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\s]+)/,
  );
  return match ? match[1] : null;
}

function ExternalLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="relative z-20 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-white/40 transition-colors hover:bg-white/10 hover:text-white/80"
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </a>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

function SteamIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 12-5.373 12-12S18.606 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.75-1.121-1.377-1.383c-.624-.26-1.29-.249-1.878-.03l1.523.63c.956.4 1.409 1.5 1.009 2.455-.397.957-1.497 1.41-2.454 1.012zm8.4-9.3c0-1.662-1.353-3.015-3.015-3.015-1.665 0-3.015 1.353-3.015 3.015 0 1.665 1.35 3.015 3.015 3.015 1.663 0 3.015-1.35 3.015-3.015zm-5.273-.005c0-1.252 1.013-2.266 2.265-2.266 1.249 0 2.266 1.014 2.266 2.266 0 1.251-1.017 2.265-2.266 2.265-1.253 0-2.265-1.014-2.265-2.265z" />
    </svg>
  );
}

export default function ProjectCard({ project }: { project: ProjectMeta }) {
  const year = new Date(project.date).getFullYear();
  const youtubeId = project.youtube ? getYouTubeId(project.youtube) : null;

  return (
    <div className="border-gradient-hover group relative flex flex-col overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.06] hover:shadow-2xl hover:shadow-accent/10">
      {/* Stretched link — makes entire card clickable */}
      <Link
        href={`/projects/${project.slug}`}
        className="absolute inset-0 z-10"
        aria-label={project.title}
      />

      {/* Image / YouTube embed */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-white/5">
        {youtubeId ? (
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&loop=1&playlist=${youtubeId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1`}
            title={project.title}
            allow="autoplay; encrypted-media"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
            style={{ border: 0 }}
          />
        ) : project.image ? (
          <Image
            src={project.image}
            alt={project.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-4xl font-bold text-white/10">{project.title.charAt(0)}</span>
          </div>
        )}
        {/* Year badge */}
        <span className="absolute left-3 top-3 z-[1] rounded-md bg-black/60 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
          {year}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="mb-1.5 text-lg font-semibold text-gray-100 transition-colors group-hover:text-accent-cyan">
          {project.title}
        </h3>
        <p className="mb-4 line-clamp-2 flex-1 text-sm leading-relaxed text-white/50">
          {project.description}
        </p>

        {/* Tags */}
        <div className="mb-3 flex flex-wrap gap-1.5">
          {project.tags.slice(0, 4).map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
          {project.tags.length > 4 && <Badge variant="outline">+{project.tags.length - 4}</Badge>}
        </div>

        {/* Links row */}
        {(project.github ||
          project.live ||
          project.steam ||
          project.appStore ||
          project.googlePlay) && (
          <div className="-ml-2 flex flex-wrap items-center gap-1 border-t border-white/[0.06] pt-3">
            {project.github && (
              <ExternalLink href={project.github} label={`${project.title} on GitHub`}>
                <GitHubIcon className="h-3.5 w-3.5" />
                GitHub
              </ExternalLink>
            )}
            {project.live && (
              <ExternalLink href={project.live} label={`${project.title} live demo`}>
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                  />
                </svg>
                Live
              </ExternalLink>
            )}
            {project.steam && (
              <ExternalLink href={project.steam} label={`${project.title} on Steam`}>
                <SteamIcon className="h-3.5 w-3.5" />
                Steam
              </ExternalLink>
            )}
            {project.appStore && (
              <ExternalLink href={project.appStore} label={`${project.title} on App Store`}>
                <svg
                  className="h-3.5 w-3.5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                App Store
              </ExternalLink>
            )}
            {project.googlePlay && (
              <ExternalLink href={project.googlePlay} label={`${project.title} on Google Play`}>
                <svg
                  className="h-3.5 w-3.5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 2.302a1 1 0 010 1.38l-2.302 2.302L15.396 12l2.302-3.492zM5.864 2.658L16.8 9.49l-2.302 2.303L5.864 2.658z" />
                </svg>
                Google Play
              </ExternalLink>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
