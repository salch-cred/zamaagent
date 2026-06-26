// Single source of truth for contract addresses + ABIs.
// Addresses come from env (populated after Sepolia deploy, DEV FILE 5).

const ZERO = '0x0000000000000000000000000000000000000000' as `0x${string}`

function addr(name: string): `0x${string}` {
  const v = process.env[name]
  if (!v) return ZERO
  return v as `0x${string}`
}

export const CONTRACTS = {
  ConfidentialPayroll: {
    address: addr('NEXT_PUBLIC_PAYROLL_ADDRESS'),
    chainId: 11155111, // Sepolia
  },
  ConfidentialInvoice: {
    address: addr('NEXT_PUBLIC_INVOICE_ADDRESS'),
    chainId: 11155111,
  },
  ConfidentialAirdrop: {
    address: addr('NEXT_PUBLIC_AIRDROP_ADDRESS'),
    chainId: 11155111,
  },
} as const

// Convenience flag — true once real addresses are configured.
// Components use it to decide between mock data and on-chain reads.
export const isConfigured = (): boolean =>
  CONTRACTS.ConfidentialPayroll.address !== ZERO &&
  CONTRACTS.ConfidentialInvoice.address !== ZERO

// ---------------------------------------------------------------------------
// ABIs
//
// `einput` / `euint64` are fhEVM ciphertext types. From TS we pass them as:
//   - handle  → `bytes32`   (encrypted value committed on-chain)
//   - proof   → `bytes`     (zk proof that the handle is well-formed)
//
// NOTE on ConfidentialInvoice.createInvoice: the Solidity contract in
// DEV FILE 5 takes a `dueDate` argument, but the ABI in DEV FILE 1/4 omits
// it (4 args). The form also never sends a dueDate. I've added dueDate to
// the ABI here so the two stay consistent; `invoices/new` passes it too.
// ---------------------------------------------------------------------------

export const PAYROLL_ABI = [
  {
    name: 'depositPayroll',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'encAmount', type: 'bytes32' },
      { name: 'inputProof', type: 'bytes' },
    ],
    outputs: [],
  },
  {
    name: 'addEmployee',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'employee', type: 'address' }],
    outputs: [],
  },
  {
    name: 'payEmployee',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'employee', type: 'address' },
      { name: 'encAmount', type: 'bytes32' },
      { name: 'inputProof', type: 'bytes' },
    ],
    outputs: [],
  },
  {
    name: 'getMyBalance',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'bytes32' }],
  },
  {
    name: 'isEmployee',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'getEmployeeCount',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const

export const INVOICE_ABI = [
  {
    name: 'createInvoice',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'client', type: 'address' },
      { name: 'encAmount', type: 'bytes32' },
      { name: 'inputProof', type: 'bytes' },
      { name: 'description', type: 'string' },
      { name: 'dueDate', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'payInvoice',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'invoiceId', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'disputeInvoice',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'invoiceId', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'getInvoiceAmount',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'invoiceId', type: 'uint256' }],
    outputs: [{ name: '', type: 'bytes32' }],
  },
  {
    name: 'getFreelancerInvoices',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'freelancer', type: 'address' }],
    outputs: [{ name: '', type: 'uint256[]' }],
  },
  {
    name: 'getInvoiceStatus',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'invoiceId', type: 'uint256' }],
    outputs: [
      { name: 'isPaid', type: 'bool' },
      { name: 'isDisputed', type: 'bool' },
      { name: 'dueDate', type: 'uint256' },
    ],
  },
] as const
