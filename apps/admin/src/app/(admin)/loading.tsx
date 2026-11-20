export default function AdminLoading() {
  return (
    <div className="space-y-6" role="status" aria-busy="true" aria-label="Đang tải dữ liệu quản trị">
      <div className="space-y-2">
        <div className="h-6 w-52 animate-pulse rounded-control bg-active motion-reduce:animate-none" />
        <div className="h-4 w-96 max-w-full animate-pulse rounded-control bg-active/70 motion-reduce:animate-none" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="rounded-card border border-border bg-raised p-4">
            <div className="h-3 w-24 animate-pulse rounded bg-active motion-reduce:animate-none" />
            <div className="mt-3 h-7 w-28 animate-pulse rounded bg-active motion-reduce:animate-none" />
            <div className="mt-2 h-3 w-20 animate-pulse rounded bg-active/70 motion-reduce:animate-none" />
          </div>
        ))}
      </div>

      <div className="space-y-2 border-t border-rule pt-4">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="h-11 w-full animate-pulse rounded-control bg-active/60 motion-reduce:animate-none" />
        ))}
      </div>
    </div>
  );
}
