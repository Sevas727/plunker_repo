import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { lusitana } from '@/app/ui/fonts';
import { getProjectBySlug, getAllProjectSlugs } from '@/app/lib/mdx';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Badge from '@/app/ui/design-system/badge';
import ImageGallery from '@/app/ui/image-gallery';

function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\s]+)/,
  );
  return match ? match[1] : null;
}

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

function ExternalLinkButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-white/60 transition-colors hover:bg-white/10"
    >
      {children}
    </a>
  );
}

export default async function ProjectPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const project = getProjectBySlug(params.slug);

  if (!project) {
    notFound();
  }

  const { meta, content } = project;
  const year = new Date(meta.date).getFullYear();
  const youtubeId = meta.youtube ? getYouTubeId(meta.youtube) : null;

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <Link
        href="/#projects"
        className="mb-8 inline-flex items-center gap-2 text-sm text-white/40 transition-colors hover:text-white"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back to all projects
      </Link>

      {/* Hero image */}
      {meta.image && (
        <div className="relative mb-8 aspect-[2/1] w-full overflow-hidden rounded-xl bg-white/5">
          <Image
            src={meta.image}
            alt={meta.title}
            fill
            className="object-cover"
            sizes="(max-width: 1200px) 100vw, 896px"
            priority
          />
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="mb-3 flex items-center gap-3">
          <Badge variant="blue">{year}</Badge>
        </div>
        <h1 className={`${lusitana.className} mb-4 text-3xl font-bold md:text-4xl`}>
          {meta.title}
        </h1>
        <div className="mb-6 flex flex-wrap gap-2">
          {meta.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>

        {/* External links */}
        {(meta.github || meta.live || meta.steam || meta.appStore || meta.googlePlay) && (
          <div className="flex flex-wrap gap-3">
            {meta.github && (
              <ExternalLinkButton href={meta.github}>
                <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                </svg>
                GitHub
              </ExternalLinkButton>
            )}
            {meta.live && (
              <ExternalLinkButton href={meta.live}>
                <svg
                  className="h-4 w-4"
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
              </ExternalLinkButton>
            )}
            {meta.steam && (
              <ExternalLinkButton href={meta.steam}>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 12-5.373 12-12S18.606 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.75-1.121-1.377-1.383c-.624-.26-1.29-.249-1.878-.03l1.523.63c.956.4 1.409 1.5 1.009 2.455-.397.957-1.497 1.41-2.454 1.012zm8.4-9.3c0-1.662-1.353-3.015-3.015-3.015-1.665 0-3.015 1.353-3.015 3.015 0 1.665 1.35 3.015 3.015 3.015 1.663 0 3.015-1.35 3.015-3.015zm-5.273-.005c0-1.252 1.013-2.266 2.265-2.266 1.249 0 2.266 1.014 2.266 2.266 0 1.251-1.017 2.265-2.266 2.265-1.253 0-2.265-1.014-2.265-2.265z" />
                </svg>
                Steam
              </ExternalLinkButton>
            )}
            {meta.appStore && (
              <ExternalLinkButton href={meta.appStore}>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                App Store
              </ExternalLinkButton>
            )}
            {meta.googlePlay && (
              <ExternalLinkButton href={meta.googlePlay}>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 2.302a1 1 0 010 1.38l-2.302 2.302L15.396 12l2.302-3.492zM5.864 2.658L16.8 9.49l-2.302 2.303L5.864 2.658z" />
                </svg>
                Google Play
              </ExternalLinkButton>
            )}
          </div>
        )}
      </div>

      {/* YouTube embed */}
      {youtubeId && (
        <div className="mb-8">
          <h2 className={`${lusitana.className} mb-4 text-xl font-bold`}>Video</h2>
          <div className="relative aspect-video w-full overflow-hidden rounded-xl">
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`}
              title={meta.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
              style={{ border: 0 }}
            />
          </div>
        </div>
      )}

      {/* Local video */}
      {meta.video && (
        <div className="mb-8">
          <h2 className={`${lusitana.className} mb-4 text-xl font-bold`}>
            {youtubeId ? 'Demo' : 'Video'}
          </h2>
          <video src={meta.video} controls className="w-full rounded-xl" preload="metadata">
            Your browser does not support the video element.
          </video>
        </div>
      )}

      {/* Image gallery */}
      {meta.images && meta.images.length > 1 && (
        <div className="mb-8">
          <h2 className={`${lusitana.className} mb-4 text-xl font-bold`}>Screenshots</h2>
          <ImageGallery images={meta.images} alt={meta.title} />
        </div>
      )}

      {/* MDX content */}
      <article className="prose prose-gray max-w-none prose-invert">
        <MDXRemote source={content} />
      </article>
    </main>
  );
}
