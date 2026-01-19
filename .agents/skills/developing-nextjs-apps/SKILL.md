---
name: developing-nextjs-apps
description: Manages Next.js 14+ application development, including App Router, Server Components, rendering strategies (SSR, SSG, ISR), and performance optimization. Use when working on Next.js frontend tasks.
---

# Developing Next.js Apps

This skill provides comprehensive guidance and standards for building production-grade Next.js 14+ applications using the App Router.

## Core Architecture (App Router)

- **React Server Components (RSC)**: Used by default for all components in `app/`. Keep client-side JavaScript minimal.
- **Client Components**: Use `'use client'` only when interactivity (hooks like `useState`, `useEffect`) or browser APIs are required.
- **Layouts & Nesting**: Use `layout.tsx` for shared UI across routes. Layouts do not re-render on navigation.
- **Streaming & Suspense**: Implement `loading.tsx` or `<Suspense>` to stream UI sections as they become ready.

## Rendering Strategies

| Strategy | Implementation | Use Case |
| :--- | :--- | :--- |
| **Static (SSG)** | Default behavior | Marketing pages, blogs, docs. |
| **Dynamic (SSR)** | Use `cookies()`, `headers()`, or `searchParams` | User dashboards, search results. |
| **Incremental (ISR)** | `fetch(url, { next: { revalidate: 60 } })` | E-commerce, news, content with periodic updates. |

## Data Fetching & Mutations

- **Server-side Fetching**: Fetch data directly in `async` Server Components.
- **Caching**: Next.js extends `fetch` to cache results. Use `revalidatePath` or `revalidateTag` to purge cache.
- **Server Actions**: Define `'use server'` functions for mutations (form submissions).
- **Parallel Fetching**: Initiate multiple requests at once to avoid waterfalls:
  ```typescript
  const [dataA, dataB] = await Promise.all([getDataA(), getDataB()]);
  ```

## Optimization Standards

- **Images**: Use `next/image` for automatic optimization, lazy loading, and preventing layout shifts.
- **Fonts**: Use `next/font` for zero layout shift and local hosting of Google Fonts.
- **Links**: Use `next/link` for prefetching and client-side navigation.
- **Middleware**: Use `middleware.ts` for auth, redirects, and header manipulation at the edge.

## File System Conventions

- `page.tsx`: Unique UI of a route.
- `layout.tsx`: Shared UI for a segment and its children.
- `loading.tsx`: Loading UI for a segment.
- `error.tsx`: Error UI for a segment.
- `not-found.tsx`: UI for 404 pages within a segment.
- `route.ts`: Custom request handlers (API endpoints).

## Best Practices

1. **Keep Server Components Pure**: Move interactivity to small, leaf-level Client Components.
2. **SEO**: Use the Metadata API (`export const metadata = {...}`).
3. **Environment Variables**: `process.env` for server, `NEXT_PUBLIC_` for client.
4. **Error Boundaries**: Always wrap dynamic sections in `error.tsx` to prevent full-page crashes.
