// Single source of truth for contract addresses + ABIs.
// Addresses come from env (populated after Sepolia deploy).

const ZERO = '0x0000000000000000000000000000000000000000' as `0x${string}`

function addr(name: string): `0x${string}` {
  const v = process.env[name]
  if (!v) return ZERO
  return v as `0x${string}`
}

// ---------------------------------------------------------------------------
// Contract addresses
// ---------------------------------------------------------------------------

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
  ConfidentialVestingWallet: {
    address: addr('NEXT_PUBLIC_VESTING_ADDRESS'),
    chainId: 11155111,
  },
} as const

/**
 * Steakhouse Confidential Prime USDC Vault
 * Deployed: June 23 2026 — Zama × Morpho × Steakhouse Financial
 * First confidential yield vault on Ethereum — $5.74M TVL
 * Boosted yield: 12-week incentive period from launch
 * Vault token: cUSDC (ERC-7984 confidential stablecoin)
 */
export const STEAKHOUSE_VAULT_ADDRESS =
  '0xbEEF00A59B577423653A1526c7009bdE103F542B' as `0x${string}`
export const STEAKHOUSE_VAULT_URL =
  'https://app.zama.org/vault/steakhouse-prime-usdc'
export const STEAKHOUSE_APY = 6.8  // % — boosted during 12-week incentive window (updated June 27 2026)
export const STEAKHOUSE_TVL = 5.74 // $M TVL at launch

export const isConfigured = (): boolean =>
  CONTRACTS.ConfidentialPayroll.address !== ZERO &&
  CONTRACTS.ConfidentialInvoice.address !== ZERO

export const isReputationConfigured = (): boolean =>
  CONTRACTS.ConfidentialReputation.address !== ZERO

export const isVestingConfigured = (): boolean =>
  CONTRACTS.ConfidentialVestingWallet.address !== ZERO

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
// Invoice ABI — includes new TFHE.select + GDPR functions
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
    name: 'createInvoice',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'freelancer',  type: 'address' },
      { name: 'encAmount',   type: 'bytes32' },
      { name: 'inputProof',  type: 'bytes' },
      { name: 'dueDate',     type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'payInvoice',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'id', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'disputeInvoice',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'id', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'autoResolveDispute',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'id', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'eraseInvoice',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'id', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'getInvoice',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'id', type: 'uint256' }],
    outputs: [
      { name: 'employer',   type: 'address' },
      { name: 'freelancer', type: 'address' },
      { name: 'amount',     type: 'uint256' },
      { name: 'dueDate',    type: 'uint256' },
      { name: 'status',     type: 'uint8'   },
      { name: 'createdAt',  type: 'uint256' },
      { name: 'paidAt',     type: 'uint256' },
    ],
  },
  {
    name: 'getFreelancerInvoices',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'freelancer', type: 'address' }],
    outputs: [{ name: '', type: 'uint256[]' }],
  },
  {
    name: 'getEmployerInvoices',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'employer', type: 'address' }],
    outputs: [{ name: '', type: 'uint256[]' }],
  },
] as const

// ---------------------------------------------------------------------------
// Vesting ABI — ConfidentialVestingWallet
// ---------------------------------------------------------------------------
export const VESTING_ABI = [
  {
    name: 'scheduleCount',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'createSchedule',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'beneficiary',     type: 'address' },
      { name: 'encTotalAmount',  type: 'bytes32' },
      { name: 'inputProof',      type: 'bytes'   },
      { name: 'cliffDuration',   type: 'uint64'  },
      { name: 'vestingDuration', type: 'uint64'  },
      { name: 'revocable',       type: 'bool'    },
    ],
    outputs: [{ name: 'id', type: 'uint256' }],
  },
  {
    name: 'release',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'id', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'revoke',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'id', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'eraseSchedule',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'id', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'getSchedule',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'id', type: 'uint256' }],
    outputs: [
      { name: 'employer',        type: 'address' },
      { name: 'beneficiary',     type: 'address' },
      { name: 'startTime',       type: 'uint64'  },
      { name: 'cliffDuration',   type: 'uint64'  },
      { name: 'vestingDuration', type: 'uint64'  },
      { name: 'revocable',       type: 'bool'    },
      { name: 'revoked',         type: 'bool'    },
      { name: 'erased',          type: 'bool'    },
    ],
  },
  {
    name: 'getEmployerSchedules',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'e', type: 'address' }],
    outputs: [{ name: '', type: 'uint256[]' }],
  },
  {
    name: 'getBeneficiarySchedules',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'b', type: 'address' }],
    outputs: [{ name: '', type: 'uint256[]' }],
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
          { name: 'category',  type: 'string'  },
          { name: 'issuedAt',  type: 'uint64'  },
          { name: 'revoked',   type: 'bool'    },
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
      { name: 'category',  type: 'string'  },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const
