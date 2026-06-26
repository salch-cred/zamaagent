'use client'

import { useAccount, useReadContract, useReadContracts } from 'wagmi'
import { CONTRACTS, REPUTATION_ABI, isReputationConfigured } from '@/lib/contracts'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const RADIUS       = 54
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const MAX_SCORE    = 1000

// Extracted style const — avoids inline double-brace objects that can get
// mangled by certain tooling; single-brace `style={dashAnimStyle}` is safe.
const dashAnimStyle = { transition: 'stroke-dasharray 1s ease' }

// ---------------------------------------------------------------------------
// Mock data (shown before deployment or when wallet is disconnected)
// ---------------------------------------------------------------------------
const MOCK_SCORE = 847
const MOCK_JOBS  = 12
const MOCK_DISPUTES = 0

const MOCK_CREDENTIALS = [
  { id: '#0001', title: 'Smart Contract Audit',  client: '0x1a2b...9f3e', date: 'Jun 12, 2026', amount: '🔐 Encrypted' },
  { id: '#0002', title: 'Frontend Development',  client: '0x7c8d...4a1f', date: 'May 28, 2026', amount: '🔐 Encrypted' },
  { id: '#0003', title: 'Backend Architecture',  client: '0x9a1c...7e2b', date: 'May 14, 2026', amount: '🔐 Encrypted' },
  { id: '#0004', title: 'Smart Contract Review', client: '0x3e5f...2b7d', date: 'Apr 30, 2026', amount: '🔐 Encrypted' },
]

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface OnChainCred {
  subject:   string
  issuer:    string
  invoiceId: bigint
  category:  string
  issuedAt:  bigint
  revoked:   boolean
}

interface DisplayCred {
  id:     string
  title:  string
  client: string
  date:   string
  amount: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function ratingLabel(score: number): string {
  if (score >= 900) return 'Excellent'
  if (score >= 700) return 'Great'
  if (score >= 500) return 'Good'
  return 'Building'
}

function shortAddr(addr: string): string {
  return addr.slice(0, 6) + '...' + addr.slice(-4)
}

function formatDate(ts: bigint): string {
  return new Date(Number(ts) * 1000).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function ReputationPage() {
  const { address } = useAccount()
  const configured  = isReputationConfigured()
  const liveEnabled = configured && !!address

  const contractBase = {
    address: CONTRACTS.ConfidentialReputation.address,
    abi: REPUTATION_ABI,
  } as const

  // Scalar on-chain reads
  const { data: scoreData, isLoading: scoreLoading } = useReadContract({
    ...contractBase,
    functionName: 'reputationScore',
    args: [address as `0x${string}`],
    query: { enabled: liveEnabled },
  })

  const { data: jobData } = useReadContract({
    ...contractBase,
    functionName: 'completedJobs',
    args: [address as `0x${string}`],
    query: { enabled: liveEnabled },
  })

  const { data: disputeData } = useReadContract({
    ...contractBase,
    functionName: 'disputes',
    args: [address as `0x${string}`],
    query: { enabled: liveEnabled },
  })

  const { data: credentialIds } = useReadContract({
    ...contractBase,
    functionName: 'getCredentials',
    args: [address as `0x${string}`],
    query: { enabled: liveEnabled },
  })

  // Batch-fetch individual credentials once we have the ID list
  const ids = (credentialIds as bigint[] | undefined) ?? []

  const { data: credentialResults } = useReadContracts({
    contracts: ids.map((id) => ({
      ...contractBase,
      functionName: 'getCredential' as const,
      args: [id] as const,
    })),
    query: { enabled: liveEnabled && ids.length > 0 },
  })

  // ---------------------------------------------------------------------------
  // Resolve display values: live > mock
  // ---------------------------------------------------------------------------
  const displayScore    = liveEnabled && scoreData    !== undefined ? Number(scoreData)    : MOCK_SCORE
  const displayJobs     = liveEnabled && jobData      !== undefined ? Number(jobData)      : MOCK_JOBS
  const displayDisputes = liveEnabled && disputeData  !== undefined ? Number(disputeData)  : MOCK_DISPUTES
  const onTimeRate      = displayJobs > 0
    ? Math.max(0, Math.round(100 - (displayDisputes / displayJobs) * 100))
    : 100

  const liveCredentials: DisplayCred[] | null =
    liveEnabled && credentialResults
      ? (credentialResults
          .map((r, i) => {
            if (r.status !== 'success') return null
            const c = r.result as OnChainCred
            if (c.revoked) return null
            return {
              id:     '#' + String(ids[i]).padStart(4, '0'),
              title:  c.category,
              client: shortAddr(c.issuer),
              date:   formatDate(c.issuedAt),
              amount: '🔐 Encrypted',
            }
          })
          .filter((x): x is DisplayCred => x !== null))
      : null

  const credentials = liveCredentials ?? MOCK_CREDENTIALS

  // ---------------------------------------------------------------------------
  // SVG ring
  // ---------------------------------------------------------------------------
  const percentage = (displayScore / MAX_SCORE) * 100
  const strokeDash = (percentage / 100) * CIRCUMFERENCE

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Reputation</h2>
          <p className="text-zinc-500 text-sm mt-1">
            Your ERC-8004 on-chain credentials — verifiable proof of completed work.
          </p>
        </div>
        {liveEnabled && (
          <span className="text-xs px-2 py-1 rounded-full bg-brand/10 text-brand border border-brand/20">
            {scoreLoading ? 'Loading…' : 'Live on-chain'}
          </span>
        )}
        {!liveEnabled && (
          <span className="text-xs px-2 py-1 rounded-full bg-zinc-800 text-zinc-500 border border-zinc-700">
            {!address ? 'Connect wallet to load live data' : 'Demo data'}
          </span>
        )}
      </div>

      {/* Score card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 mb-6 flex items-center gap-12">
        {/* Circular progress ring */}
        <div className="relative flex-shrink-0">
          <svg width="140" height="140" viewBox="0 0 140 140">
            <circle cx="70" cy="70" r={RADIUS} fill="none" stroke="#27272A" strokeWidth="10" />
            <circle
              cx="70" cy="70" r={RADIUS}
              fill="none"
              stroke="#22C55E"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${strokeDash} ${CIRCUMFERENCE}`}
              transform="rotate(-90 70 70)"
              style={dashAnimStyle}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold text-white font-mono">{displayScore}</div>
            <div className="text-xs text-zinc-500">/ {MAX_SCORE}</div>
          </div>
        </div>

        <div className="flex-1">
          <div className="text-2xl font-bold text-white mb-1">{ratingLabel(displayScore)}</div>
          <p className="text-zinc-400 text-sm mb-4">
            Your reputation puts you in the top 15% of freelancers on PayMate.
          </p>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-xl font-bold text-white font-mono">{displayJobs}</div>
              <div className="text-zinc-500 text-xs">Paid invoices</div>
            </div>
            <div>
              <div className="text-xl font-bold text-white font-mono">{displayDisputes}</div>
              <div className="text-zinc-500 text-xs">Disputes</div>
            </div>
            <div>
              <div className="text-xl font-bold text-white font-mono">{onTimeRate}%</div>
              <div className="text-zinc-500 text-xs">On-time rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Credentials list */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800">
          <h3 className="font-semibold text-white">ERC-8004 Credentials</h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Each credential is minted on Ethereum upon payment confirmation
          </p>
        </div>
        {credentials.length === 0 ? (
          <div className="px-6 py-10 text-center text-zinc-500 text-sm">
            No credentials yet. Complete your first invoice to earn one.
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/50">
            {credentials.map((cred) => (
              <div
                key={cred.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-zinc-800/30 transition-colors"
              >
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
        )}
      </div>
    </div>
  )
}
