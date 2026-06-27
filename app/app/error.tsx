'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[PayMate error boundary]', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="w-12 h-12 bg-red-900/20 border border-red-700/40 rounded-2xl flex items-center justify-center">
        <AlertTriangle className="w-6 h-6 text-red-400" />
      </div>
      <div className="text-center">
        <div className="text-white font-semibold mb-1">Something went wrong</div>
        <div className="text-zinc-500 text-sm max-w-sm">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </div>
        {error.digest && (
          <div className="text-zinc-700 text-xs mt-1 font-mono">{error.digest}</div>
        )}
      </div>
      <button
        onClick={reset}
        className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm text-zinc-300 hover:text-white transition-all"
      >
        <RefreshCw className="w-4 h-4" />
        Try again
      </button>
    </div>
  );
}
