// fhEVM client helpers.
//
// The real fhevmjs flow is:
//
//   1. createInstance({ chainId, network, gatewayUrl?, aclContractAddress?, kmsContractAddress? })
//   2. For encrypting user input: instance.createEncryptedInput(contract, user)
//   3. For re-encrypting an on-chain handle so the user can read it:
//        - generate a keypair (createKeypair() OR generateKeypair() depending
//          on the installed fhevmjs version) -> { privateKey, publicKey }
//        - sign the EIP-712 reencryption message with the wallet
//        - instance.reencrypt(handle, privateKey, publicKey, signature, contract, user)
//
// Gateway / ACL / KMS addresses are read from env so they can be updated if
// Zama rotates them, without a code change. Leave them unset to fall back to
// the defaults baked into your installed fhevmjs build.
//
// Until contracts are deployed, isConfigured() from contracts.ts is false and
// the UI shows mock encrypted balances, so this module is never called in dev.

import { createInstance, type FhevmInstance } from 'fhevmjs'
import { BrowserProvider } from 'ethers'

let fhevmInstance: FhevmInstance | null = null

const SEPOLIA_CHAIN_ID = 11155111
const GATEWAY_URL = process.env.NEXT_PUBLIC_FHEVM_GATEWAY_URL || ''
const ACL_ADDRESS = process.env.NEXT_PUBLIC_FHEVM_ACL_ADDRESS || ''
const KMS_ADDRESS = process.env.NEXT_PUBLIC_FHEVM_KMS_ADDRESS || ''

export async function getFhevmInstance(): Promise<FhevmInstance> {
  if (fhevmInstance) return fhevmInstance
  if (typeof window === 'undefined') throw new Error('fhevm helpers are browser-only')
  if (!window.ethereum) throw new Error('No EIP-1193 provider found')

  // Build config defensively: only attach optional fields when provided so we
  // never pass empty strings that fhevmjs would reject. `network` must be the
  // EIP-1193 provider (not a chain id number).
  const config: Record<string, unknown> = {
    chainId: SEPOLIA_CHAIN_ID,
    network: window.ethereum,
  }
  if (GATEWAY_URL) config.gatewayUrl = GATEWAY_URL
  if (ACL_ADDRESS) config.aclContractAddress = ACL_ADDRESS
  if (KMS_ADDRESS) config.kmsContractAddress = KMS_ADDRESS

  fhevmInstance = await createInstance(config as Parameters<typeof createInstance>[0])
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
 * Re-encrypt an encrypted handle so the connected user can read their own balance.
 * Uses the EIP-712 reencryption signature flow.
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

  // Generate a re-encryption keypair. fhevmjs builds differ: 0.6 exposes
  // generateKeypair(), some expose createKeypair(). Support both, no args.
  const anyInstance = instance as unknown as {
    createKeypair?: () => { publicKey: string; privateKey: string }
    generateKeypair?: () => { publicKey: string; privateKey: string }
  }
  const makeKeypair = anyInstance.generateKeypair || anyInstance.createKeypair
  if (!makeKeypair) throw new Error('fhevmjs instance exposes no keypair generator')
  const { publicKey, privateKey } = makeKeypair.call(instance)

  // Build the EIP-712 payload the wallet must sign.
  const eip712 = instance.createEIP712(publicKey, contractAddress)
  const signature = await signer.signTypedData(
    eip712.domain,
    { Reencrypt: eip712.types.Reencrypt },
    eip712.message
  )

  // reencrypt() expects a bigint handle, not a 0x string.
  const result = await instance.reencrypt(
    BigInt(encryptedHandle),
    privateKey,
    publicKey,
    signature,
    contractAddress,
    userAddress
  )

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
