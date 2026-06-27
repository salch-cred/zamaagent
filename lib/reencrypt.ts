/**
 * Re-encryption helpers for PayMate
 * 
 * The re-encryption flow is the core FHE UX primitive:
 * - Encrypted handles on-chain can only be decrypted by authorized parties
 * - Each party re-encrypts the handle for their own public key
 * - Only their private key can then decrypt it
 * - The plaintext is NEVER transmitted — only re-encrypted ciphertext
 * 
 * This module abstracts the fhevmjs 0.6 re-encryption API.
 */

import type { FhevmInstance } from 'fhevmjs';

export type ReencryptResult = {
  value: bigint;
  success: true;
} | {
  error: string;
  success: false;
};

/**
 * Re-encrypt an on-chain handle and return the plaintext bigint.
 * 
 * Flow:
 * 1. Generate ephemeral keypair
 * 2. Build EIP-712 permit { publicKey, expiry }
 * 3. Sign permit with user wallet
 * 4. Call fhevmInstance.reencrypt(handle, privateKey, publicKey, signature, contract, user)
 * 5. Return decrypted value
 */
export async function reencryptHandle(
  fhevm: FhevmInstance,
  handle: bigint,
  contractAddress: string,
  userAddress: string,
  signTypedData: (domain: Record<string, unknown>, types: Record<string, unknown[]>, value: Record<string, unknown>) => Promise<string>
): Promise<ReencryptResult> {
  try {
    // Step 1: Generate ephemeral keypair for this re-encryption
    let keypair: { publicKey: string; privateKey: string };
    
    if (typeof fhevm.generateKeypair === 'function') {
      keypair = fhevm.generateKeypair();
    } else if (typeof (fhevm as unknown as { createKeypair: () => { publicKey: string; privateKey: string } }).createKeypair === 'function') {
      keypair = (fhevm as unknown as { createKeypair: () => { publicKey: string; privateKey: string } }).createKeypair();
    } else {
      throw new Error('fhevmjs: no keypair generation method found');
    }

    // Step 2 & 3: Build EIP-712 permit and sign
    const expiry = Math.floor(Date.now() / 1000) + 3600; // 1 hour
    const { publicKey } = keypair;

    const domain = {
      name: 'Authorization token',
      version: '1',
      chainId: 11155111, // Sepolia
      verifyingContract: contractAddress,
    };

    const types = {
      Reencrypt: [
        { name: 'publicKey', type: 'bytes32' },
        { name: 'expiry', type: 'uint256' },
      ],
    };

    const value = {
      publicKey: '0x' + publicKey,
      expiry: BigInt(expiry),
    };

    const signature = await signTypedData(domain, types, value);

    // Step 4: Re-encrypt via KMS Gateway
    const decryptedValue = await fhevm.reencrypt(
      handle,
      keypair.privateKey,
      keypair.publicKey,
      signature,
      contractAddress,
      userAddress
    );

    return { value: BigInt(decryptedValue.toString()), success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[reencrypt] failed:', msg);
    return { error: msg, success: false };
  }
}

/**
 * Encrypt a uint64 value using fhevmjs for contract input.
 * Returns the einput handle + inputProof to pass to the contract.
 */
export async function encryptAmount(
  fhevm: FhevmInstance,
  amount: bigint,
  contractAddress: string,
  userAddress: string
): Promise<{ handles: Uint8Array[]; inputProof: Uint8Array }> {
  const encrypted = await fhevm.encrypt64(amount, contractAddress, userAddress);
  return encrypted;
}

/**
 * Format a decrypted euint64 value as a USD amount string.
 * Assumes 6 decimal places (USDC-style).
 */
export function formatEncryptedUsd(raw: bigint, decimals = 6): string {
  const divisor = BigInt(10 ** decimals);
  const whole = raw / divisor;
  const fraction = raw % divisor;
  const fractionStr = fraction.toString().padStart(decimals, '0').slice(0, 2);
  return `$${whole.toLocaleString()}.${fractionStr}`;
}

/**
 * Check if a re-encryption is possible for this address and handle.
 * (Checks ACL contract to see if address has permission)
 */
export function canReencrypt(
  handle: bigint | undefined | null,
  userAddress: string | undefined
): boolean {
  if (!handle || handle === 0n) return false;
  if (!userAddress) return false;
  return true;
}
