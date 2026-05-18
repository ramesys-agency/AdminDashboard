export default function DashboardLoading() {
  return (
    <div className="max-w-6xl mx-auto">
      {/* PageHeader skeleton */}
      <div className="flex items-start gap-3.5 mb-8">
        <div className="w-1 h-8 rounded-full bg-gray-200 animate-pulse hidden sm:block" />
        <div className="space-y-2">
          <div className="h-7 w-40 bg-gray-200 animate-pulse rounded-md" />
          <div className="h-4 w-64 bg-gray-100 animate-pulse rounded-md" />
        </div>
      </div>

      {/* Search bar skeleton */}
      <div className="flex gap-3 mb-4">
        <div className="h-9 w-72 bg-gray-100 animate-pulse rounded-lg" />
        <div className="h-9 w-28 bg-gray-100 animate-pulse rounded-lg" />
      </div>

      {/* Table skeleton */}
      <div className="mt-4 rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm">
        {/* Header row */}
        <div className="border-b border-gray-100 px-5 h-11 flex items-center gap-8">
          {[100, 80, 90, 70, 60, 50].map((w, i) => (
            <div key={i} className="h-2.5 bg-gray-200 animate-pulse rounded-full" style={{ width: w }} />
          ))}
        </div>
        {/* Data rows */}
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="px-5 h-[52px] border-b border-gray-100 last:border-0 flex items-center gap-8">
            {[110, 85, 95, 75, 65, 55].map((w, j) => (
              <div
                key={j}
                className="h-3.5 bg-gray-100 animate-pulse rounded-full"
                style={{ width: `${w * (0.7 + ((i + j) % 3) * 0.15)}px` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
