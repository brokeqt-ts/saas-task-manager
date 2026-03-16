export default function DashboardPageLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-14 bg-white border-b border-gray-200 fixed top-0 left-0 right-0 md:left-64 z-20 flex items-center px-4">
        <div className="h-4 w-24 bg-gray-200 rounded" />
      </div>
      <div className="p-3 md:p-6 space-y-4 md:space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="w-10 h-10 bg-gray-100 rounded-lg mb-3" />
              <div className="h-7 w-10 bg-gray-200 rounded mb-1" />
              <div className="h-4 w-20 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-5 h-64" />
          <div className="bg-white border border-gray-200 rounded-xl p-5 h-64" />
        </div>
      </div>
    </div>
  );
}
