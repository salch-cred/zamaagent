export default function Loading() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-brand border-t-transparent rounded-full animate-spin" />
        <span className="text-zinc-500 text-sm">Loading…</span>
      </div>
    </div>
  );
}
