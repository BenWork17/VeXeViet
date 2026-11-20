import { Spinner } from '@/components/ui/spinner';

export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-8 lg:py-10">
        <div className="mb-6 flex items-center gap-2.5 text-sm font-medium text-muted-foreground">
          <Spinner size="sm" label="Đang tải tài khoản" />
          <span>Đang tải thông tin tài khoản…</span>
        </div>

        <div aria-hidden="true" className="space-y-8">
          <div className="rounded-lg border border-border bg-card p-6 shadow-hn-sm md:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-5">
                <div className="h-20 w-20 shrink-0 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
                <div className="space-y-2.5">
                  <div className="h-5 w-36 animate-pulse rounded bg-muted motion-reduce:animate-none" />
                  <div className="h-8 w-56 animate-pulse rounded bg-muted motion-reduce:animate-none" />
                  <div className="h-4 w-48 animate-pulse rounded bg-muted motion-reduce:animate-none" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 lg:min-w-[360px]">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-24 animate-pulse rounded-md bg-muted motion-reduce:animate-none"
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="space-y-4">
              <div className="space-y-2 rounded-lg border border-border bg-card p-3 shadow-hn-sm">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-16 animate-pulse rounded-md bg-muted motion-reduce:animate-none"
                  />
                ))}
              </div>
              <div className="h-36 animate-pulse rounded-lg border border-border bg-card p-5 shadow-hn-sm motion-reduce:animate-none" />
            </aside>

            <div className="rounded-lg border border-border bg-card p-6 shadow-hn-sm md:p-8">
              <div className="space-y-2 border-b border-border pb-5">
                <div className="h-4 w-32 animate-pulse rounded bg-muted motion-reduce:animate-none" />
                <div className="h-7 w-56 animate-pulse rounded bg-muted motion-reduce:animate-none" />
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-16 animate-pulse rounded-md bg-muted motion-reduce:animate-none"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
