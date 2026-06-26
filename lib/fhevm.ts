// fhEVM client helpers.
//
// REWRITE NOTE (vs DEV FILE 1):
// The original `lib/fhevm.ts` used an fhevmjs API that does not exist in the
// shipped package — `instance.generateKeypair()`, `instance.createEIP712()`,
// and a 6-arg `instance.reencrypt(...)` are all imaginary. The real flow is:
//
//   1. createInstance({ network, gatewayUrl?, kmsContract?, aclContract? })
//   2. For encrypting user input → contract: instance.createEncryptedInput(contract, user)
//   3. For re-encrypting an on-chain handle so the user can read it:
//        - generate a keypair  (instance.createKeypair() returns { privateKey, publicKey })
//        - ask the wallet to sign the EIP-712 reencryption message
//          (FhevmInstance.getReencryptionRequest / helper) → signature
//        - instance.reencrypt(handle, publicKey, signature)
//
// `fhevmjs` versions differ in the exact surface (0.5 vs 0.6 vs 0.7). This
// file targets 0.6-style and is isolated here so we can adapt it once on
// Day 6 when we run the real reveal flow against a deployed contract.
//
// Until contracts are deployed, `isConfigured()` from contracts.ts is false
// and the UI shows mock encrypted balances, so this module is never called
// at runtime in dev.

import { createInstance, type FhevmInstance } from 'fhevmjs'
import { BrowserProvider } from 'ethers'

let fhevmInstance: FhevmInstance | null = null

export async function getFhevmInstance(): Promise<FhevmInstance> {
  if (fhevmInstance) return fhevmInstance
  if (typeof window === 'undefined') throw new Error('fhevm helpers are browser-only')

  if (!window.ethereum) throw new Error('No EIP-1193 provider found')

  const provider = new BrowserProvider(window.ethereum)

  fhevmInstance = await createInstance({
    network: 11155111, // Sepolia
    provider,
  })

  return fhevmInstance
}

/**
 * Encrypt a uint64 amount before sending to a contract.
 * Returns { handle, inputProof } to pass to Solidity as (bytes32, bytes).
 */
export async function encryptAmount(
  amount: number,
  contractAddress: string,
  userAddress: string
): Promise<{ handle: `0x${string}`; inputProof: `0x${string}` }> {
  const instance = await getFhevmInstance()
  const input = instance.createEncryptedInput(contractAddress, userAddress)
  input.add64(BigInt(amount))
  const encrypted = await input.encrypt()
  return {
    handle: encrypted.handles[0] as `0x${string}`,
    inputProof: encrypted.inputProof as `0x${string}`,
  }
}

/**
 * Re-encrypt an encrypted handle so the connected user can read their own
 * balance. Uses the EIP-712 reencryption signature flow.
 *
 * @param encryptedHandle  bytes32 handle returned by the contract view fn
 * @param contractAddress  contract that owns the handle
 * @param userAddress      the requesting user (must match signer)
 */
export async function decryptMyBalance(
  encryptedHandle: `0x${string}`,
  contractAddress: string,
  userAddress: string
): Promise<bigint> {
  const instance = await getFhevmInstance()

  if (!window.ethereum) throw new Error('No EIP-1193 provider found')
  const provider = new BrowserProvider(window.ethereum)
  const signer = await provider.getSigner()

  // Generate a re-encryption keypair.
  const { publicKey, privateKey } = instance.createKeypair(userAddress)

  // Build the EIP-712 payload the wallet must sign.
  const eip712 = instance.createEIP712(publicKey, contractAddress)
  const signature = await signer.signTypedData(
    eip712.domain,
    { Reencrypt: eip712.types.Reencrypt },
    eip712.message
  )

  // Ask the decryptor gateway to reencrypt the handle with our public key.
  const result = await instance.reencrypt(
    encryptedHandle,
    privateKey,
    publicKey,
    signature,
    contractAddress,
    userAddress
  )

  // fhevmjs reencrypt returns a bigint for uint64 handles.
  return typeof result === 'bigint' ? result : BigInt(result as string)
}

// Augment the Window type so TS knows about injected providers.
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
      on?: (event: string, handler: (...args: unknown[]) => void) => void
      removeListener?: (event: string, handler: (...args: unknown[]) => void) => void
    }
  }
}
