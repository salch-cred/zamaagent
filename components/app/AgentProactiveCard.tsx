'use client'
import { useState } from 'react'

export function AgentProactiveCard() {
  const [dismissed, setDismissed] = useState(false)
  const [acted, setActed]         = useState(false)

  if (dismissed) return null

  return (
    <div className="mb-6 bg-zinc-900 border border-zinc-700 rounded-2xl p-5 flex items-start gap-4">
      {/* AI avatar */}
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand/30 to-fhe/30 border border-zinc-700 flex items-center justify-center text-xl flex-shrink-0">
        🤖
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold text-white">PayMate AI Agent</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-brand/20 text-brand border border-brand/30">Active</span>
        </div>

        {!acted ? (
          <>
            <p className="text-sm text-zinc-400 mb-3">
              Invoice <span className="text-white font-mono">#003</span> to{' '}
              <span className="text-white font-mono">0x3e5f...2b7d</span> is{' '}
              <span className="text-yellow-400 font-medium">7 days overdue</span>.
              Want me to send a payment reminder?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setActed(true)}
                className="px-4 py-1.5 bg-brand hover:bg-brand-dark text-black text-xs font-semibold rounded-lg transition-all"
              >
                Yes, send reminder
              </button>
              <button
                onClick={() => setDismissed(true)}
                className="px-4 py-1.5 border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-white text-xs rounded-lg transition-all"
              >
                Dismiss
              </button>
            </div>
          </>
        ) : (
          <p className="text-sm text-brand">
            ✅ Reminder sent! I&apos;ll follow up again in 48 hours if there&apos;s no response.
          </p>
        )}
      </div>

      <button
        onClick={() => setDismissed(true)}
        className="text-zinc-600 hover:text-zinc-400 text-lg flex-shrink-0 transition-colors"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  )
}
