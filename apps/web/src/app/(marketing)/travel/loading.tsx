import { Spinner } from '@/components/ui/spinner';

export default function TravelLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex items-center gap-2.5 text-sm font-medium text-muted-foreground">
          <Spinner size="sm" label="Đang tải bản đồ du lịch" />
          <span>Đang tải bản đồ và lịch trình du lịch…</span>
        </div>

        <div className="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]" aria-hidden="true">
          <div className="space-y-4 rounded-lg border border-border bg-card p-5 shadow-hn-sm">
            <div className="h-7 w-3/4 animate-pulse rounded bg-muted motion-reduce:animate-none" />
            <div className="h-4 w-full animate-pulse rounded bg-muted motion-reduce:animate-none" />
            <div className="h-11 w-full animate-pulse rounded-md bg-muted motion-reduce:animate-none" />
            <div className="h-11 w-full animate-pulse rounded-md bg-muted motion-reduce:animate-none" />
            <div className="h-11 w-full animate-pulse rounded-md bg-muted motion-reduce:animate-none" />
            <div className="h-40 w-full animate-pulse rounded-md bg-muted motion-reduce:animate-none" />
          </div>
          <div className="min-h-[540px] animate-pulse rounded-lg border border-border bg-muted motion-reduce:animate-none" />
        </div>
      </div>
    </div>
  );
}
