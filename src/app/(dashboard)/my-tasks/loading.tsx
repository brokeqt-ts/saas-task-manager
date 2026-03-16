export default function MyTasksLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-14 bg-white border-b border-gray-200 fixed top-0 left-0 right-0 md:left-64 z-20 flex items-center px-4">
        <div className="h-4 w-28 bg-gray-200 rounded" />
      </div>
      <div className="p-3 md:p-6 max-w-3xl">
        {/* Tabs skeleton */}
        <div className="flex gap-4 mb-4 border-b border-gray-200 pb-2">
          <div className="h-4 w-24 bg-gray-200 rounded" />
          <div className="h-4 w-28 bg-gray-100 rounded" />
        </div>
        {/* Task list skeleton */}
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-gray-200" />
              <div className="flex-1">
                <div className="h-4 w-48 bg-gray-200 rounded mb-1" />
                <div className="h-3 w-24 bg-gray-100 rounded" />
              </div>
              <div className="h-3 w-16 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
