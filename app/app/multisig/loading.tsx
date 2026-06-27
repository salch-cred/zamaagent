export default function MultiSigLoading() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8 animate-pulse">
      <div className="h-8 w-72 bg-zinc-800 rounded-lg mb-4" />
      <div className="h-4 w-96 bg-zinc-800 rounded mb-8" />
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="h-3 w-16 bg-zinc-800 rounded mx-auto mb-2" />
            <div className="h-8 w-12 bg-zinc-800 rounded mx-auto" />
          </div>
        ))}
      </div>
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <div className="flex justify-between mb-3">
              <div className="space-y-2">
                <div className="h-4 w-48 bg-zinc-800 rounded" />
                <div className="h-3 w-32 bg-zinc-800 rounded" />
              </div>
              <div className="h-6 w-20 bg-zinc-800 rounded-full" />
            </div>
            <div className="h-1.5 w-full bg-zinc-800 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
