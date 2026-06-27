export default function WrappersLoading() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8 animate-pulse">
      <div className="h-8 w-72 bg-zinc-800 rounded-lg mb-4" />
      <div className="h-4 w-96 bg-zinc-800 rounded mb-8" />
      <div className="grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-zinc-800 rounded-xl" />
              <div className="space-y-2">
                <div className="h-4 w-20 bg-zinc-800 rounded" />
                <div className="h-3 w-32 bg-zinc-800 rounded" />
              </div>
            </div>
            <div className="h-3 w-full bg-zinc-800 rounded mb-2" />
            <div className="h-3 w-4/5 bg-zinc-800 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
