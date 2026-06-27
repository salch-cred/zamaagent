'use client';

import { useState } from 'react';
import { useAccount, useSignTypedData } from 'wagmi';
import { Eye, EyeOff, Loader2, Lock } from 'lucide-react';

interface ReencryptButtonProps {
  /** The encrypted handle (as hex string or bigint) */
  handle?: string | bigint | null;
  /** The contract address that holds this handle */
  contractAddress?: string;
  /** Label for what is being revealed, e.g. "balance", "salary" */
  label?: string;
  /** Optional className override */
  className?: string;
  /** Formatter for the revealed value */
  formatter?: (val: bigint) => string;
}

const DEFAULT_FORMATTER = (val: bigint) => {
  // Assume USDC 6-decimal format
  const usdc = Number(val) / 1e6;
  return `$${usdc.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export default function ReencryptButton({
  handle,
  contractAddress,
  label = 'amount',
  className,
  formatter = DEFAULT_FORMATTER,
}: ReencryptButtonProps) {
  const { address } = useAccount();
  const { signTypedDataAsync } = useSignTypedData();
  const [revealed, setRevealed] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasHandle = !!handle && handle !== '0x0' && handle !== 0n;

  const handleReveal = async () => {
    if (!address || !hasHandle) return;
    if (revealed) {
      setRevealed(null); // toggle off
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Dynamically import fhevmjs to avoid SSR issues
      const { createInstance } = await import('fhevmjs');
      
      const gatewayUrl = process.env.NEXT_PUBLIC_FHEVM_GATEWAY_URL || 'https://gateway.sepolia.zama.ai';
      const aclAddress = process.env.NEXT_PUBLIC_FHEVM_ACL_ADDRESS || '0x';
      const kmsAddress = process.env.NEXT_PUBLIC_FHEVM_KMS_ADDRESS || '0x';

      const fhevm = await createInstance({
        kmsContractAddress: kmsAddress,
        aclContractAddress: aclAddress,
        network: window.ethereum,
        gatewayUrl,
      });

      // Generate keypair for re-encryption
      const generateFn = (fhevm as unknown as Record<string, () => { publicKey: string; privateKey: string }>).generateKeypair
        || (fhevm as unknown as Record<string, () => { publicKey: string; privateKey: string }>).createKeypair;
      const keypair = generateFn.call(fhevm);

      const contractAddr = contractAddress || '0x0000000000000000000000000000000000000000';
      const expiry = Math.floor(Date.now() / 1000) + 3600;

      // Sign EIP-712 permit
      const signature = await signTypedDataAsync({
        domain: {
          name: 'Authorization token',
          version: '1',
          chainId: 11155111,
          verifyingContract: contractAddr as `0x${string}`,
        },
        types: {
          Reencrypt: [
            { name: 'publicKey', type: 'bytes32' },
            { name: 'expiry', type: 'uint256' },
          ],
        },
        primaryType: 'Reencrypt',
        message: {
          publicKey: ('0x' + keypair.publicKey) as `0x${string}`,
          expiry: BigInt(expiry),
        },
      });

      const handleBigInt = typeof handle === 'string' ? BigInt(handle) : (handle as bigint);

      // Call KMS Gateway re-encryption
      const decrypted = await fhevm.reencrypt(
        handleBigInt,
        keypair.privateKey,
        keypair.publicKey,
        signature,
        contractAddr,
        address
      );

      setRevealed(formatter(BigInt(decrypted.toString())));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      // In mock mode (no contracts deployed), show simulated value
      if (msg.includes('network') || msg.includes('contract') || msg.includes('ACL') || !hasHandle) {
        const mockVal = BigInt(Math.floor(Math.random() * 9000 + 1000)) * BigInt(1e6);
        setRevealed(formatter(mockVal) + ' (demo)');
      } else {
        setError('Re-encryption failed. Check wallet connection.');
        console.error('[ReencryptButton]', msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasHandle && !revealed) {
    return (
      <div className="flex items-center gap-1.5">
        <Lock className="w-3.5 h-3.5 text-zinc-600" />
        <span className="text-zinc-600 font-mono text-sm">•••••</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      {revealed ? (
        <span className="text-brand font-semibold text-sm tabular-nums">{revealed}</span>
      ) : (
        <span className="text-zinc-500 font-mono text-sm">•••••</span>
      )}
      <button
        onClick={handleReveal}
        disabled={isLoading}
        title={revealed ? `Hide ${label}` : `Reveal ${label} (re-encryption)`}
        className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 hover:border-zinc-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : revealed ? (
          <EyeOff className="w-3 h-3" />
        ) : (
          <Eye className="w-3 h-3" />
        )}
        {isLoading ? 'Decrypting...' : revealed ? 'Hide' : 'Reveal'}
      </button>
      {error && (
        <span className="text-red-400 text-xs">{error}</span>
      )}
    </div>
  );
}
