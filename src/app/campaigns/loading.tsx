export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="h-8 w-48 animate-pulse rounded bg-muted" />
      <div className="mt-2 h-5 w-72 animate-pulse rounded bg-muted" />
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border p-4">
            <div className="h-44 animate-pulse rounded bg-muted" />
            <div className="mt-3 h-5 w-3/4 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-4 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
