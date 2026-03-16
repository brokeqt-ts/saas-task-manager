export default function ProjectLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-14 bg-white border-b border-gray-200 fixed top-0 left-0 right-0 md:left-64 z-20 flex items-center px-4">
        <div className="h-4 w-36 bg-gray-200 rounded" />
      </div>
      <div className="p-3 md:p-6">
        {/* Project header skeleton */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="h-5 w-40 bg-gray-200 rounded mb-2" />
            <div className="h-3 w-28 bg-gray-100 rounded" />
          </div>
          <div className="h-8 w-28 bg-gray-200 rounded-lg" />
        </div>
        {/* Search bar skeleton */}
        <div className="flex gap-2 mb-3">
          <div className="flex-1 h-9 bg-gray-100 rounded-lg" />
          <div className="h-9 w-40 bg-gray-100 rounded-lg" />
        </div>
        {/* Columns skeleton */}
        <div className="flex flex-col md:flex-row gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex-1 min-w-0">
              <div className="h-4 w-20 bg-gray-200 rounded mb-2" />
              <div className="space-y-2">
                {[...Array(2)].map((_, j) => (
                  <div key={j} className="bg-white border border-gray-200 rounded-lg p-3 h-20" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
