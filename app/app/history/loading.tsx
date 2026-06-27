export default function HistoryLoading() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8 animate-pulse">
      <div className="h-8 w-64 bg-zinc-800 rounded-lg mb-4" />
      <div className="h-4 w-80 bg-zinc-800 rounded mb-8" />
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center px-6 py-4 border-b border-zinc-800">
            <div className="w-9 h-9 bg-zinc-800 rounded-xl flex-shrink-0" />
            <div className="flex-1 ml-4 space-y-2">
              <div className="h-4 w-40 bg-zinc-800 rounded" />
              <div className="h-3 w-56 bg-zinc-800 rounded" />
            </div>
            <div className="w-20 h-4 bg-zinc-800 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
