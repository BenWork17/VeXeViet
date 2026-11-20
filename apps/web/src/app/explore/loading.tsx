import { Spinner } from '@/components/ui/spinner';

export default function ExploreLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 xl:px-10">
        {/* Status Indicator */}
        <div
          className="mb-6 flex items-center justify-between border-b border-border pb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-2.5">
            <Spinner size="sm" label="Đang tải ấn phẩm Khám phá Việt Nam" />
            <span>Đang xuất bản ấn phẩm Khám Phá Việt Nam…</span>
          </div>
          <span className="hidden sm:inline">VeXeViet Discovery • Ấn phẩm Đặc biệt</span>
        </div>

        {/* Newspaper Masthead Skeleton */}
        <div className="mb-8 border-b-2 border-foreground/80 pb-6" aria-hidden="true">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-3">
            <div className="h-3.5 w-44 animate-pulse rounded bg-muted motion-reduce:animate-none" />
            <div className="h-3.5 w-64 animate-pulse rounded bg-muted motion-reduce:animate-none" />
            <div className="h-3.5 w-40 animate-pulse rounded bg-muted motion-reduce:animate-none" />
          </div>

          <div className="my-6 flex flex-col items-center space-y-3 text-center">
            <div className="h-4 w-56 animate-pulse rounded bg-muted motion-reduce:animate-none" />
            <div className="h-12 w-3/4 max-w-2xl animate-pulse rounded-md bg-muted sm:h-16 motion-reduce:animate-none" />
            <div className="h-4 w-2/3 max-w-lg animate-pulse rounded bg-muted motion-reduce:animate-none" />
          </div>

          {/* Filter & Search Bar Skeleton */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            <div className="flex flex-wrap items-center gap-2">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-9 w-24 animate-pulse rounded-full bg-muted motion-reduce:animate-none"
                />
              ))}
            </div>
            <div className="h-10 w-full animate-pulse rounded-lg bg-muted sm:w-72 motion-reduce:animate-none" />
          </div>
        </div>

        {/* Lead Story + AI Concierge Split Skeleton */}
        <div className="mb-12 grid gap-8 border-b border-border pb-10 lg:grid-cols-12" aria-hidden="true">
          {/* Cover Story Column */}
          <div className="space-y-4 lg:col-span-8 lg:border-r lg:border-border lg:pr-8">
            <div className="flex items-center gap-3">
              <div className="h-6 w-32 animate-pulse rounded bg-primary/20 motion-reduce:animate-none" />
              <div className="h-4 w-28 animate-pulse rounded bg-muted motion-reduce:animate-none" />
            </div>
            <div className="h-10 w-11/12 animate-pulse rounded bg-muted motion-reduce:animate-none" />
            <div className="h-5 w-4/5 animate-pulse rounded bg-muted motion-reduce:animate-none" />
            <div className="aspect-16/9 w-full animate-pulse rounded-xl border border-border bg-muted motion-reduce:animate-none" />
            <div className="grid gap-4 pt-2 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="h-4 w-full animate-pulse rounded bg-muted motion-reduce:animate-none" />
                <div className="h-4 w-11/12 animate-pulse rounded bg-muted motion-reduce:animate-none" />
                <div className="h-4 w-4/5 animate-pulse rounded bg-muted motion-reduce:animate-none" />
              </div>
              <div className="space-y-2 border-l-2 border-primary/40 pl-4">
                <div className="h-4 w-full animate-pulse rounded bg-muted motion-reduce:animate-none" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-muted motion-reduce:animate-none" />
              </div>
            </div>
          </div>

          {/* AI Vibe Matcher / Concierge Sidebar Column */}
          <div className="space-y-4 lg:col-span-4">
            <div className="rounded-xl border border-border bg-card p-5 shadow-hn-sm">
              <div className="mb-3 h-6 w-3/5 animate-pulse rounded bg-muted motion-reduce:animate-none" />
              <div className="mb-4 h-4 w-full animate-pulse rounded bg-muted motion-reduce:animate-none" />
              <div className="mb-4 h-20 w-full animate-pulse rounded-lg bg-muted motion-reduce:animate-none" />
              <div className="mb-4 flex flex-wrap gap-2">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="h-7 w-28 animate-pulse rounded-full bg-muted motion-reduce:animate-none"
                  />
                ))}
              </div>
              <div className="h-10 w-full animate-pulse rounded-lg bg-primary/25 motion-reduce:animate-none" />
            </div>

            <div className="space-y-3 rounded-xl border border-border bg-card p-5">
              <div className="h-5 w-1/2 animate-pulse rounded bg-muted motion-reduce:animate-none" />
              <div className="h-16 w-full animate-pulse rounded-lg bg-muted motion-reduce:animate-none" />
              <div className="h-16 w-full animate-pulse rounded-lg bg-muted motion-reduce:animate-none" />
            </div>
          </div>
        </div>

        {/* Multi-column Newspaper Articles Grid Skeleton */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="flex flex-col justify-between space-y-4 rounded-xl border border-border bg-card p-5 shadow-hn-sm"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-5 w-24 animate-pulse rounded bg-muted motion-reduce:animate-none" />
                  <div className="h-4 w-16 animate-pulse rounded bg-muted motion-reduce:animate-none" />
                </div>
                <div className="aspect-16/10 w-full animate-pulse rounded-lg bg-muted motion-reduce:animate-none" />
                <div className="h-7 w-5/6 animate-pulse rounded bg-muted motion-reduce:animate-none" />
                <div className="h-4 w-full animate-pulse rounded bg-muted motion-reduce:animate-none" />
                <div className="h-4 w-4/5 animate-pulse rounded bg-muted motion-reduce:animate-none" />
              </div>

              <div className="space-y-2 border-t border-border pt-3">
                <div className="h-3.5 w-32 animate-pulse rounded bg-muted motion-reduce:animate-none" />
                <div className="h-8 w-full animate-pulse rounded bg-muted motion-reduce:animate-none" />
                <div className="flex items-center justify-between pt-2">
                  <div className="h-9 w-28 animate-pulse rounded-lg bg-muted motion-reduce:animate-none" />
                  <div className="h-9 w-28 animate-pulse rounded-lg bg-muted motion-reduce:animate-none" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
