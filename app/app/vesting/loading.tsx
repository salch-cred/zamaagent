export default function VestingLoading() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8 animate-pulse">
      <div className="h-8 w-64 bg-zinc-800 rounded-lg mb-4" />
      <div className="h-4 w-96 bg-zinc-800 rounded mb-8" />
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <div className="flex justify-between mb-4">
              <div className="space-y-2">
                <div className="h-5 w-52 bg-zinc-800 rounded" />
                <div className="h-3 w-36 bg-zinc-800 rounded" />
              </div>
              <div className="h-6 w-16 bg-zinc-800 rounded-full" />
            </div>
            <div className="h-3 w-full bg-zinc-800 rounded mb-2" />
            <div className="h-2 w-full bg-zinc-800 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
