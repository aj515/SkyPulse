export default function Skeleton() {
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Hero Card Skeleton */}
      <div className="glass-card-static p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="skeleton h-8 w-48 mb-2" />
            <div className="skeleton h-4 w-24" />
          </div>
        </div>
        <div className="flex items-center gap-6 mb-6">
          <div className="skeleton w-28 h-28 rounded-full" />
          <div>
            <div className="skeleton h-16 w-40 mb-2" />
            <div className="skeleton h-4 w-32 mb-2" />
            <div className="skeleton h-5 w-36" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-16 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Hourly Skeleton */}
      <div className="glass-card-static p-6">
        <div className="skeleton h-6 w-44 mb-4" />
        <div className="flex gap-2 overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton h-24 w-[68px] rounded-xl shrink-0" />
          ))}
        </div>
        <div className="skeleton h-[200px] rounded-xl mt-4" />
      </div>

      {/* Daily Skeleton */}
      <div className="glass-card-static p-6">
        <div className="skeleton h-6 w-40 mb-4" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton h-12 rounded-xl mb-2" />
        ))}
      </div>
    </div>
  );
}
