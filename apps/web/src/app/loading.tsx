import { Spinner } from '@/components/ui/spinner';

export default function RootLoading() {
  return (
    <div className="min-h-[60vh] bg-background">
      <div className="mx-auto flex min-h-[60vh] max-w-7xl flex-col items-center justify-center gap-3 px-4 py-16">
        <Spinner size="lg" label="Đang tải trang..." />
        <p className="text-sm font-medium text-muted-foreground">Đang tải trang…</p>
      </div>
    </div>
  );
}
