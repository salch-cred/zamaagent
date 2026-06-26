const SCORE       = 847
const MAX_SCORE   = 1000
const PERCENTAGE  = (SCORE / MAX_SCORE) * 100
const RADIUS      = 54
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const STROKE_DASH = (PERCENTAGE / 100) * CIRCUMFERENCE

// Extracted to a const so the JSX uses a single-brace `style={...}` ref
// (inline double-brace object literals were getting mangled on save).
const dashAnimStyle = { transition: 'stroke-dasharray 1s ease' }

const credentials = [
  { id: '#0001', title: 'Smart Contract Audit',   client: '0x1a2b...9f3e', date: 'Jun 12, 2026', amount: '🔐 Encrypted' },
  { id: '#0002', title: 'Frontend Development',   client: '0x7c8d...4a1f', date: 'May 28, 2026', amount: '🔐 Encrypted' },
  { id: '#0003', title: 'Backend Architecture',   client: '0x9a1c...7e2b', date: 'May 14, 2026', amount: '🔐 Encrypted' },
  { id: '#0004', title: 'Smart Contract Review',  client: '0x3e5f...2b7d', date: 'Apr 30, 2026', amount: '🔐 Encrypted' },
]

export default function ReputationPage() {
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Reputation</h2>
        <p className="text-zinc-500 text-sm mt-1">Your ERC-8004 on-chain credentials — verifiable proof of completed work.</p>
      </div>

      {/* Score card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 mb-6 flex items-center gap-12">
        {/* Circular progress */}
        <div className="relative flex-shrink-0">
          <svg width="140" height="140" viewBox="0 0 140 140">
            <circle cx="70" cy="70" r={RADIUS} fill="none" stroke="#27272A" strokeWidth="10" />
            <circle
              cx="70" cy="70" r={RADIUS}
              fill="none"
              stroke="#22C55E"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${STROKE_DASH} ${CIRCUMFERENCE}`}
              transform="rotate(-90 70 70)"
              style={dashAnimStyle}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold text-white font-mono">{SCORE}</div>
            <div className="text-xs text-zinc-500">/ {MAX_SCORE}</div>
          </div>
        </div>

        <div className="flex-1">
          <div className="text-2xl font-bold text-white mb-1">Excellent</div>
          <p className="text-zinc-400 text-sm mb-4">Your reputation puts you in the top 15% of freelancers on PayMate.</p>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-xl font-bold text-white font-mono">12</div>
              <div className="text-zinc-500 text-xs">Paid invoices</div>
            </div>
            <div>
              <div className="text-xl font-bold text-white font-mono">0</div>
              <div className="text-zinc-500 text-xs">Disputes</div>
            </div>
            <div>
              <div className="text-xl font-bold text-white font-mono">100%</div>
              <div className="text-zinc-500 text-xs">On-time rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Credentials list */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800">
          <h3 className="font-semibold text-white">ERC-8004 Credentials</h3>
          <p className="text-xs text-zinc-500 mt-0.5">Each credential is minted on Ethereum upon payment confirmation</p>
        </div>
        <div className="divide-y divide-zinc-800/50">
          {credentials.map(cred => (
            <div key={cred.id} className="flex items-center justify-between px-6 py-4 hover:bg-zinc-800/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center">
                  <span className="text-brand text-sm">✓</span>
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{cred.title}</div>
                  <div className="text-xs text-zinc-500">{cred.client} • {cred.date}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-500 font-mono">{cred.amount}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-brand/10 text-brand border border-brand/20">
                  Verified
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
