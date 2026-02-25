# ADR-004: MDX Content for Portfolio

## Status

Accepted

## Date

2026-02-24

## Context

The public-facing portfolio needs to display project information. We need a content strategy that is:

- Easy to maintain (add/edit projects)
- Type-safe and developer-friendly
- Performant (static or server-rendered)
- Git-versioned alongside code

## Decision

### Content Source: MDX Files

Project content is stored as `.mdx` files in a `content/projects/` directory at the repository root. MDX allows mixing Markdown with JSX components.

The "About Me" section on the home page is static JSX — not MDX — since it is a single, rarely changing section that benefits from direct component control.

### File Structure

```
content/
└── projects/
    ├── fedotov-dashboard.mdx
    ├── other-project.mdx
    └── ...
```

### Frontmatter Schema

Each project MDX file has frontmatter:

```yaml
---
title: "Project Name"
slug: "project-slug"
description: "Short description for cards"
tags: ["Next.js", "TypeScript"]
date: "2025-01-01"
image: "/projects/preview.png"
github: "https://github.com/..."
live: "https://live-url.com"
order: 1
---
Full MDX content here...
```

- `slug` matches the filename (used for `/projects/[slug]` routing)
- `order` controls display order on the home page
- `image` is optional — stored in `public/projects/`

### Libraries

| Library            | Purpose                                       |
| ------------------ | --------------------------------------------- |
| `gray-matter`      | Parse YAML frontmatter from MDX files         |
| `next-mdx-remote`  | Render MDX content in React Server Components |
| `rehype-highlight` | Syntax highlighting for code blocks           |

### Utility Module: `app/lib/mdx.ts`

Two main functions:

- `getAllProjects()` — reads all MDX files, parses frontmatter, returns sorted metadata array (for home page cards)
- `getProjectBySlug(slug)` — reads single MDX file, returns frontmatter + compiled MDX content (for project page)

### Rendering

- **Home page (`/`)**: calls `getAllProjects()`, renders project cards from frontmatter only (no MDX compilation needed)
- **Project page (`/projects/[slug]`)**: calls `getProjectBySlug(slug)`, renders full MDX content with `<MDXRemote />`
- **Static generation**: `generateStaticParams()` in `[slug]/page.tsx` for build-time generation of all project pages

## Alternatives Considered

| Option                               | Pros                                   | Cons                                                   |
| ------------------------------------ | -------------------------------------- | ------------------------------------------------------ |
| **Database**                         | Dynamic, admin-editable                | Overkill for 3-10 projects, requires CMS UI            |
| **Contentlayer**                     | Type-safe, great DX                    | Maintenance concerns, project stale                    |
| **@next/mdx**                        | Official, zero-config                  | No frontmatter, requires file-system routing in `app/` |
| **gray-matter + next-mdx-remote** ✅ | Flexible, well-maintained, RSC support | Manual setup                                           |

## Consequences

- Adding a new project = adding a `.mdx` file and committing to git
- No database dependency for portfolio content
- Full MDX power: can embed React components in project descriptions
- `generateStaticParams` enables static generation for project pages at build time
- Content is versioned alongside code in the same repository
