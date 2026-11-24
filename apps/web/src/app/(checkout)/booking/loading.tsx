import { Spinner } from '@/components/ui/spinner';

export default function BookingLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center gap-2.5 text-sm font-medium text-muted-foreground">
        <Spinner size="sm" label="Đang tải bước đặt vé" />
        <span>Đang tải thông tin đặt vé…</span>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]" aria-hidden="true">
        <div className="rounded-lg border border-border bg-card p-6 shadow-hn-sm">
          <div className="h-6 w-48 animate-pulse rounded bg-muted motion-reduce:animate-none" />
          <div className="mt-6 grid grid-cols-4 gap-3">
            {Array.from({ length: 16 }).map((_, index) => (
              <div
                key={index}
                className="h-12 animate-pulse rounded-md bg-muted motion-reduce:animate-none"
              />
            ))}
          </div>
        </div>

        <aside className="space-y-4 rounded-lg border border-border bg-card p-6 shadow-hn-sm">
          <div className="h-6 w-32 animate-pulse rounded bg-muted motion-reduce:animate-none" />
          <div className="h-20 w-full animate-pulse rounded-md bg-muted motion-reduce:animate-none" />
          <div className="h-16 w-full animate-pulse rounded-md bg-muted motion-reduce:animate-none" />
          <div className="h-11 w-full animate-pulse rounded-md bg-muted motion-reduce:animate-none" />
        </aside>
      </div>
    </div>
  );
}
