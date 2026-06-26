export default function StoreLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="skeleton h-9 w-24" />
        <div className="skeleton h-5 w-48" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-lg border border-color-border">
            <div className="skeleton aspect-square w-full rounded-none" />
            <div className="space-y-2 p-4">
              <div className="skeleton h-5 w-3/4" />
              <div className="skeleton h-4 w-1/2" />
            </div>
            <div className="flex items-center justify-between border-t border-color-border px-4 py-3">
              <div className="skeleton h-5 w-16" />
              <div className="skeleton h-5 w-14" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
