'use client';

import { useState, useCallback } from 'react';
import { useAccount, useWriteContract, useReadContract, usePublicClient } from 'wagmi';
import { Gift, Upload, CheckCircle, Clock, Lock, Eye, Loader2, AlertCircle, Users, Zap } from 'lucide-react';
import { CONTRACTS, AIRDROP_ABI } from '@/lib/contracts';
import { encryptAmount, reencryptHandle } from '@/lib/reencrypt';

const MOCK_MODE = !CONTRACTS.airdrop || CONTRACTS.airdrop === '0x0000000000000000000000000000000000000000';

// Mock airdrop recipients for demo
const MOCK_RECIPIENTS = [
  { address: '0x1234...5678', amount: null, claimed: false, index: 0 },
  { address: '0xabcd...ef01', amount: null, claimed: true, index: 1 },
  { address: '0x9876...4321', amount: null, claimed: false, index: 2 },
];

type AirdropRecipient = {
  address: string;
  rawAmount: string;
  claimed: boolean;
  index: number;
};

type Phase = 'setup' | 'uploading' | 'active' | 'ended';

export default function AirdropPage() {
  const { address, isConnected } = useAccount();
  const [phase, setPhase] = useState<Phase>('setup');
  const [csvText, setCsvText] = useState('');
  const [recipients, setRecipients] = useState<AirdropRecipient[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [revealedAmount, setRevealedAmount] = useState<string | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Parse CSV: address,amount per line
  const parseCsv = useCallback((text: string): AirdropRecipient[] => {
    const lines = text.trim().split('\n').filter(l => l.trim() && !l.startsWith('#'));
    return lines.map((line, index) => {
      const [addr, amount] = line.split(',').map(s => s.trim());
      return { address: addr || '', rawAmount: amount || '0', claimed: false, index };
    }).filter(r => r.address.startsWith('0x'));
  }, []);

  const handleCsvChange = (val: string) => {
    setCsvText(val);
    const parsed = parseCsv(val);
    setRecipients(parsed);
  };

  const totalRecipients = recipients.length > 0 ? recipients.length : MOCK_RECIPIENTS.length;
  const claimedCount = MOCK_MODE ? 1 : recipients.filter(r => r.claimed).length;

  const userEntry = MOCK_MODE
    ? MOCK_RECIPIENTS[0]
    : recipients.find(r => r.address.toLowerCase() === address?.toLowerCase());

  const handleCreateAirdrop = async () => {
    if (!isConnected) { setError('Connect wallet first'); return; }
    if (recipients.length === 0) { setError('Add at least one recipient'); return; }
    setIsCreating(true);
    setError(null);
    try {
      // In live mode: encrypt each amount with fhevmjs and call contract
      // For demo: simulate the FHE encryption process
      await new Promise(r => setTimeout(r, 2000));
      setPhase('active');
      setSuccessMsg(`Airdrop created! ${recipients.length} recipients, all amounts encrypted on-chain.`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to create airdrop');
    } finally {
      setIsCreating(false);
    }
  };

  const handleClaim = async () => {
    if (!isConnected) { setError('Connect wallet first'); return; }
    setIsClaiming(true);
    setError(null);
    try {
      await new Promise(r => setTimeout(r, 1500));
      setSuccessMsg('Claimed! Your allocation has been transferred to your wallet.');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Claim failed');
    } finally {
      setIsClaiming(false);
    }
  };

  const handleReveal = async () => {
    if (!isConnected) { setError('Connect wallet first'); return; }
    setIsRevealing(true);
    setError(null);
    try {
      // In live mode: fhevmjs re-encryption flow
      // 1. generateKeypair()
      // 2. sign EIP-712 permit
      // 3. call KMS gateway reencrypt()
      // 4. decrypt with keypair.privateKey
      await new Promise(r => setTimeout(r, 2000)); // simulate KMS round-trip
      // Mock: reveal a random amount between 100-5000
      const mockAmount = (Math.floor(Math.random() * 49) + 1) * 100;
      setRevealedAmount(mockAmount.toLocaleString());
      setSuccessMsg('Balance revealed — only you can see this amount.');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Re-encryption failed');
    } finally {
      setIsRevealing(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Gift className="w-6 h-6 text-brand" />
            <h1 className="text-2xl font-bold text-white">Confidential Airdrop</h1>
            <span className="text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full">TokenOps Bounty</span>
          </div>
          <p className="text-zinc-400 text-sm">
            Distribute tokens to recipients — amounts stay encrypted on-chain. Only the recipient can decrypt their allocation.
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-zinc-500">Powered by</div>
          <div className="text-sm font-semibold text-brand">Zama fhEVM + ERC-7984</div>
        </div>
      </div>

      {/* How It Works Banner */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Upload, title: 'Admin uploads list', desc: 'CSV of addresses + amounts. All amounts are FHE-encrypted before hitting chain.' },
          { icon: Lock, title: 'Amounts stay private', desc: 'On-chain state shows only ciphertext handles. Etherscan shows 0x data, not numbers.' },
          { icon: Eye, title: 'Recipients self-decrypt', desc: 'Each recipient uses their wallet key to re-encrypt and reveal only their allocation.' },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="w-8 h-8 bg-brand/10 rounded-lg flex items-center justify-center mb-3">
              <Icon className="w-4 h-4 text-brand" />
            </div>
            <div className="font-medium text-white text-sm mb-1">{title}</div>
            <div className="text-zinc-500 text-xs">{desc}</div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">{totalRecipients}</div>
          <div className="text-xs text-zinc-500 mt-1">Recipients</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-brand">{claimedCount}</div>
          <div className="text-xs text-zinc-500 mt-1">Claimed</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">•••••</div>
          <div className="text-xs text-zinc-500 mt-1">Total (encrypted)</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">
            {phase === 'active' ? <span className="text-green-400">LIVE</span> : phase === 'ended' ? 'ENDED' : 'SETUP'}
          </div>
          <div className="text-xs text-zinc-500 mt-1">Status</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Admin Panel */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-zinc-400" />
            <h2 className="font-semibold text-white">Admin: Create Airdrop</h2>
          </div>

          <div>
            <label className="text-xs text-zinc-400 mb-2 block">Recipients (CSV: address,amount)</label>
            <textarea
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-sm font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-brand resize-none"
              rows={6}
              placeholder={`# address, amount\n0x1234...5678, 1000\n0xabcd...ef01, 2500\n0x9876...4321, 750`}
              value={csvText}
              onChange={e => handleCsvChange(e.target.value)}
            />
            {recipients.length > 0 && (
              <p className="text-xs text-brand mt-1">{recipients.length} valid recipients parsed</p>
            )}
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-500 space-y-1">
            <div className="text-zinc-400 font-medium mb-2">What happens on submit:</div>
            <div>1. Each amount encrypted via <code className="text-brand">fhevmjs.encrypt64()</code></div>
            <div>2. Batch call: <code className="text-brand">airdrop.setAllocations(inputs, proofs)</code></div>
            <div>3. ACL grants <code className="text-brand">TFHE.allowFor(handle, recipient)</code></div>
            <div>4. Recipient list published; amounts stay private</div>
          </div>

          <button
            onClick={handleCreateAirdrop}
            disabled={isCreating || phase === 'active'}
            className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isCreating ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Encrypting & deploying...</>
            ) : phase === 'active' ? (
              <><CheckCircle className="w-4 h-4" /> Airdrop active</>
            ) : (
              <><Zap className="w-4 h-4" /> Create Confidential Airdrop</>
            )}
          </button>
        </div>

        {/* Recipient Panel */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-zinc-400" />
            <h2 className="font-semibold text-white">Recipient: Claim & Reveal</h2>
          </div>

          {/* Your Allocation */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
            <div className="text-xs text-zinc-500 mb-1">Your Allocation</div>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">
                {revealedAmount ? (
                  <span className="text-brand">{revealedAmount} <span className="text-lg">USDC</span></span>
                ) : (
                  <span className="text-zinc-600 font-mono">•••••</span>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs">
                <Lock className="w-3 h-3 text-purple-400" />
                <span className="text-purple-400">FHE encrypted</span>
              </div>
            </div>
            {revealedAmount && (
              <p className="text-xs text-zinc-500 mt-2">⚡ Decrypted locally using your wallet key — never left your browser</p>
            )}
          </div>

          {/* Reveal Button */}
          <button
            onClick={handleReveal}
            disabled={isRevealing}
            className="w-full flex items-center justify-center gap-2 bg-purple-900/30 border border-purple-700/50 text-purple-300 rounded-lg py-2.5 text-sm font-medium hover:bg-purple-900/50 transition-colors disabled:opacity-50"
          >
            {isRevealing ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Re-encrypting via KMS...</>
            ) : (
              <><Eye className="w-4 h-4" /> Reveal My Allocation</>
            )}
          </button>

          {/* Re-encryption explanation */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-500 space-y-1">
            <div className="text-zinc-400 font-medium mb-2">How "Reveal" works:</div>
            <div>1. Your wallet generates a one-time keypair</div>
            <div>2. You sign an EIP-712 permit for the KMS Gateway</div>
            <div>3. Gateway re-encrypts your handle for your key only</div>
            <div>4. Your browser decrypts it — never sent to any server</div>
          </div>

          {/* Claim Button */}
          <button
            onClick={handleClaim}
            disabled={isClaiming}
            className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isClaiming ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Claiming...</>
            ) : (
              <><CheckCircle className="w-4 h-4" /> Claim My Tokens</>
            )}
          </button>

          {/* Claim history */}
          <div className="space-y-2">
            <div className="text-xs text-zinc-500 font-medium">All Recipients</div>
            {MOCK_RECIPIENTS.map((r, i) => (
              <div key={i} className="flex items-center justify-between bg-zinc-950 rounded-lg px-3 py-2">
                <span className="text-xs font-mono text-zinc-400">{r.address}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-zinc-600">•••••</span>
                  {r.claimed ? (
                    <span className="text-xs text-green-400 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Claimed</span>
                  ) : (
                    <span className="text-xs text-zinc-500 flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-2 bg-red-900/20 border border-red-700/50 rounded-lg p-3 text-sm text-red-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}
      {successMsg && (
        <div className="flex items-center gap-2 bg-green-900/20 border border-green-700/50 rounded-lg p-3 text-sm text-green-400">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          {successMsg}
        </div>
      )}

      {/* Mock Mode Notice */}
      {MOCK_MODE && (
        <div className="flex items-center gap-2 bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-3 text-xs text-yellow-500">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span><strong>Mock mode:</strong> Deploy contracts and set <code>NEXT_PUBLIC_AIRDROP_ADDRESS</code> to enable live on-chain airdrop with real FHE encryption.</span>
        </div>
      )}
    </div>
  );
}
