import { Spinner } from '@/components/ui/spinner';

export default function RouteDetailLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex items-center gap-2.5 text-sm font-medium text-muted-foreground">
          <Spinner size="sm" label="Đang tải chi tiết chuyến xe" />
          <span>Đang tải thông tin chuyến xe…</span>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row" aria-hidden="true">
          <div className="min-w-0 flex-1 space-y-6">
            <div className="rounded-lg border border-border bg-card p-6 shadow-hn-sm">
              <div className="flex items-center justify-between">
                <div className="h-6 w-44 animate-pulse rounded bg-muted motion-reduce:animate-none" />
                <div className="h-6 w-24 animate-pulse rounded bg-muted motion-reduce:animate-none" />
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="h-16 animate-pulse rounded bg-muted motion-reduce:animate-none" />
                <div className="h-16 animate-pulse rounded bg-muted motion-reduce:animate-none" />
                <div className="h-16 animate-pulse rounded bg-muted motion-reduce:animate-none" />
              </div>
              <div className="mt-6 flex items-center gap-4 border-t border-border pt-6">
                <div className="h-14 w-14 animate-pulse rounded-md bg-muted motion-reduce:animate-none" />
                <div className="space-y-2">
                  <div className="h-5 w-40 animate-pulse rounded bg-muted motion-reduce:animate-none" />
                  <div className="h-4 w-28 animate-pulse rounded bg-muted motion-reduce:animate-none" />
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-6 shadow-hn-sm">
              <div className="flex gap-3 border-b border-border pb-4">
                <div className="h-9 w-28 animate-pulse rounded-md bg-muted motion-reduce:animate-none" />
                <div className="h-9 w-28 animate-pulse rounded-md bg-muted motion-reduce:animate-none" />
                <div className="h-9 w-28 animate-pulse rounded-md bg-muted motion-reduce:animate-none" />
              </div>
              <div className="mt-5 space-y-3">
                <div className="h-4 w-full animate-pulse rounded bg-muted motion-reduce:animate-none" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-muted motion-reduce:animate-none" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-muted motion-reduce:animate-none" />
              </div>
            </div>
          </div>

          <aside className="shrink-0 lg:w-96">
            <div className="space-y-5 rounded-lg border border-border bg-card p-6 shadow-hn-sm">
              <div className="space-y-2 border-b border-border pb-5">
                <div className="h-4 w-28 animate-pulse rounded bg-muted motion-reduce:animate-none" />
                <div className="h-10 w-44 animate-pulse rounded bg-muted motion-reduce:animate-none" />
              </div>
              <div className="h-16 w-full animate-pulse rounded-md bg-muted motion-reduce:animate-none" />
              <div className="h-12 w-full animate-pulse rounded-md bg-muted motion-reduce:animate-none" />
              <div className="space-y-2.5 border-t border-border pt-4">
                <div className="h-4 w-40 animate-pulse rounded bg-muted motion-reduce:animate-none" />
                <div className="h-4 w-36 animate-pulse rounded bg-muted motion-reduce:animate-none" />
                <div className="h-4 w-32 animate-pulse rounded bg-muted motion-reduce:animate-none" />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
