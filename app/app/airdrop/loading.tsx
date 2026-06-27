export default function Loading() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="h-8 w-64 bg-zinc-800 rounded-lg animate-pulse" />
      <div className="grid grid-cols-3 gap-3">
        {[1,2,3].map(i => <div key={i} className="h-24 bg-zinc-900 rounded-xl animate-pulse" />)}
      </div>
      <div className="grid grid-cols-4 gap-3">
        {[1,2,3,4].map(i => <div key={i} className="h-20 bg-zinc-900 rounded-xl animate-pulse" />)}
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="h-96 bg-zinc-900 rounded-xl animate-pulse" />
        <div className="h-96 bg-zinc-900 rounded-xl animate-pulse" />
      </div>
    </div>
  );
}
