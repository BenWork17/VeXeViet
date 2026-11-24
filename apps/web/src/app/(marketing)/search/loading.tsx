import { Spinner } from '@/components/ui/spinner';

export default function SearchLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/60 py-8">
        <div className="mx-auto max-w-7xl px-4">
          <div className="h-9 w-72 animate-pulse rounded bg-muted motion-reduce:animate-none" />
          <div className="mt-3 flex gap-4">
            <div className="h-4 w-28 animate-pulse rounded bg-muted motion-reduce:animate-none" />
            <div className="h-4 w-28 animate-pulse rounded bg-muted motion-reduce:animate-none" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex items-center gap-2.5 text-sm font-medium text-muted-foreground">
          <Spinner size="sm" label="Đang tải danh sách chuyến xe" />
          <span>Đang tải danh sách chuyến xe…</span>
        </div>

        <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]" aria-hidden="true">
          <aside className="hidden space-y-4 rounded-lg border border-border bg-card p-5 lg:block">
            <div className="h-5 w-24 animate-pulse rounded bg-muted motion-reduce:animate-none" />
            <div className="h-12 w-full animate-pulse rounded bg-muted motion-reduce:animate-none" />
            <div className="h-24 w-full animate-pulse rounded bg-muted motion-reduce:animate-none" />
            <div className="h-24 w-full animate-pulse rounded bg-muted motion-reduce:animate-none" />
          </aside>

          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="rounded-lg border border-border bg-card p-5 shadow-hn-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="h-5 w-40 animate-pulse rounded bg-muted motion-reduce:animate-none" />
                  <div className="h-6 w-24 animate-pulse rounded bg-muted motion-reduce:animate-none" />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div className="h-12 animate-pulse rounded bg-muted motion-reduce:animate-none" />
                  <div className="h-12 animate-pulse rounded bg-muted motion-reduce:animate-none" />
                  <div className="h-12 animate-pulse rounded bg-muted motion-reduce:animate-none" />
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                  <div className="h-5 w-32 animate-pulse rounded bg-muted motion-reduce:animate-none" />
                  <div className="h-10 w-28 animate-pulse rounded-md bg-muted motion-reduce:animate-none" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
