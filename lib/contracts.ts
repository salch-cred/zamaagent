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
    chainId: 11155111,
  },
  ConfidentialInvoice: {
    address: addr('NEXT_PUBLIC_INVOICE_ADDRESS'),
    chainId: 11155111,
  },
  ConfidentialAirdrop: {
    address: addr('NEXT_PUBLIC_AIRDROP_ADDRESS'),
    chainId: 11155111,
  },
  ConfidentialReputation: {
    address: addr('NEXT_PUBLIC_REPUTATION_ADDRESS'),
    chainId: 11155111,
  },
} as const

export const isConfigured = (): boolean =>
  CONTRACTS.ConfidentialPayroll.address !== ZERO &&
  CONTRACTS.ConfidentialInvoice.address !== ZERO

export const isReputationConfigured = (): boolean =>
  CONTRACTS.ConfidentialReputation.address !== ZERO

// ---------------------------------------------------------------------------
// Payroll ABI
// ---------------------------------------------------------------------------
export const PAYROLL_ABI = [
  {
    name: 'employer',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
  },
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
    name: 'removeEmployee',
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
    outputs: [{ name: '', type: 'uint256' }],
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
  {
    name: 'getEmployees',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address[]' }],
  },
] as const

// ---------------------------------------------------------------------------
// Invoice ABI
// ---------------------------------------------------------------------------
export const INVOICE_ABI = [
  {
    name: 'invoiceCount',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'invoices',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'invoiceId', type: 'uint256' }],
    outputs: [
      { name: 'freelancer',      type: 'address' },
      { name: 'client',          type: 'address' },
      { name: 'amount',          type: 'uint256' },
      { name: 'isPaid',          type: 'bool' },
      { name: 'isDisputed',      type: 'bool' },
      { name: 'createdAt',       type: 'uint256' },
      { name: 'dueDate',         type: 'uint256' },
      { name: 'workDescription', type: 'string' },
    ],
  },
  {
    name: 'createInvoice',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'client',      type: 'address' },
      { name: 'encAmount',   type: 'bytes32' },
      { name: 'inputProof',  type: 'bytes' },
      { name: 'description', type: 'string' },
      { name: 'dueDate',     type: 'uint256' },
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
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'getFreelancerInvoices',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'freelancer', type: 'address' }],
    outputs: [{ name: '', type: 'uint256[]' }],
  },
  {
    name: 'getClientInvoices',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'client', type: 'address' }],
    outputs: [{ name: '', type: 'uint256[]' }],
  },
  {
    name: 'getInvoiceStatus',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'invoiceId', type: 'uint256' }],
    outputs: [
      { name: 'isPaid',     type: 'bool' },
      { name: 'isDisputed', type: 'bool' },
      { name: 'dueDate',    type: 'uint256' },
    ],
  },
] as const

// ---------------------------------------------------------------------------
// Reputation ABI
// ---------------------------------------------------------------------------
export const REPUTATION_ABI = [
  {
    name: 'reputationScore',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'subject', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'completedJobs',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'disputes',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'getCredentials',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'subject', type: 'address' }],
    outputs: [{ name: '', type: 'uint256[]' }],
  },
  {
    name: 'getCredential',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'id', type: 'uint256' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'subject',   type: 'address' },
          { name: 'issuer',    type: 'address' },
          { name: 'invoiceId', type: 'uint256' },
          { name: 'category',  type: 'string' },
          { name: 'issuedAt',  type: 'uint64' },
          { name: 'revoked',   type: 'bool' },
        ],
      },
    ],
  },
  {
    name: 'issueCredential',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'subject',   type: 'address' },
      { name: 'issuer',    type: 'address' },
      { name: 'invoiceId', type: 'uint256' },
      { name: 'category',  type: 'string' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const
