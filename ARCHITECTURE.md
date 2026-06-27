# PayMate — Deep Architecture

## FHE Data Flow

### Encrypting a Salary (Client → Chain)

```
1. Employee wallet generates ephemeral keypair
   keypair = fhevmjs.createKeypair()

2. Employer UI calls fhevmjs.encrypt64(amount)
   → returns { handles: [Uint8Array], inputProof: Uint8Array }

3. Contract call: addEmployee(address, einput, inputProof)
   → TFHE.asEuint64(einput, inputProof) stores euint64 handle
   → ACL grants access: TFHE.allowFor(handle, employee)
   → ACL grants access: TFHE.allowFor(handle, employer)

4. On-chain state: mapping(address => euint64) salaries
   → All observers see only a 32-byte ciphertext handle
   → Handle cannot be decrypted without KMS Gateway + ACL permission
```

### Re-encryption Flow (Employee Reveals Their Balance)

```
1. Employee clicks "Reveal Balance"
   → fhevmjs.generateKeypair() creates wallet-bound keypair
   → keypair.publicKey used as re-encryption target

2. Employee signs EIP-712 permit:
   permit = { publicKey, expiry }
   signature = wallet.signTypedData(permit)

3. KMS Gateway re-encrypts the handle for employee's publicKey
   → result = reencrypt(handle, permit, signature)
   → result is encrypted ONLY for employee's publicKey

4. Frontend decrypts with employee's privateKey
   → plaintext = fhevmjs.decrypt(result, keypair.privateKey)
   → Shows: "Your balance: $4,200.00"

5. Balance is NEVER decrypted on-chain or visible to any other party
```

### FHE Comparison (AI Agent Checks Overdue)

```solidity
// Contract can compare encrypted amounts without revealing them
ebool isOverdue = TFHE.gt(dueDate, block.timestamp);
ebool hasPayment = TFHE.gt(invoice.encryptedAmount, TFHE.asEuint64(0));

// Result is an encrypted boolean — true/false stays private
// AI agent queries the result, sees only "overdue: yes/no"
// Actual invoice amount is never exposed
```

## Contract Architecture

### ConfidentialPayroll.sol

```
State:
  mapping(address => euint64) private _salaries      ← encrypted
  mapping(address => euint64) private _balances       ← encrypted  
  mapping(address => bool) public employees
  address public employer

Key FHE operations:
  TFHE.asEuint64(einput, proof)     ← encrypt input
  TFHE.add(balance, salary)         ← add without decrypt
  TFHE.gt(balance, amount)          ← compare without decrypt
  TFHE.select(condition, a, b)      ← conditional without branch
  TFHE.allowFor(handle, addr)       ← grant decrypt access

Underflow guard:
  ebool sufficient = TFHE.gte(balance, amount);
  // Revert if insufficient — FHE-safe, no amount revealed
  uint256 check = TFHE.decrypt(sufficient);  // only boolean!
  require(check == 1, "insufficient");
```

### ReputationRegistry.sol (ERC-8004)

```
Score formula: 1000 * completedJobs / (completedJobs + 2 * disputes)

The score itself is PUBLIC (reputation should be verifiable)
But the underlying invoice amounts that produced it are PRIVATE

This is the FHE superpower:
  - Reputation: public ✅ (provable)
  - Invoice amounts: private ✅ (encrypted)
  - Business relationships: configurable
```

## Composability Patterns

### Pattern 1: Payroll × Reputation
```
onfidentialInvoice.markPaid()
  → emits InvoicePaid(freelancer, clientId)
  → ReputationRegistry.recordCompletion(freelancer)
  → score updates without revealing invoice amount
```

### Pattern 2: Payroll × Morpho Yield
```
When employer funds payroll contract:
  excess = totalFunds - totalSalaries (encrypted comparison)
  if (excess > threshold):
    MorphoVault.deposit(excessAmount) → earns APY
    
On payday:
  MorphoVault.withdraw(amount)
  → distributes to employees
  → net cost of payroll reduced by yield
```

### Pattern 3: AI Agent × FHE Invoices
```
Agent monitors:
  TFHE.gt(currentTime, dueDate) → encrypted overdue flag
  TFHE.gt(encryptedAmount, 0)   → encrypted has-value flag
  
Agent reports:
  "3 invoices overdue" (count, not amounts)
  "High-value invoice pending" (relative, not absolute)
  
Agent never decrypts amounts — operates on FHE boolean results only
```

## Security Properties

| Property | Guarantee |
|---|---|
| Salary confidentiality | `euint64` never decrypted on-chain |
| Invoice amount privacy | All amounts stored as ciphertext handles |
| Access control | ACL contract enforces per-handle permissions |
| Replay protection | EIP-712 signed permits with expiry |
| Underflow safety | FHE comparison, only boolean decrypted |
| Front-running | Encrypted inputs opaque to mempool observers |
| Admin key compromise | `employer` key only controls ACL grants, not decrypt |

## Gas Estimates (Sepolia)

| Operation | Estimated Gas |
|---|---|
| `addEmployee` (FHE encrypt) | ~500,000 |
| `processPayroll` (FHE add × N) | ~200,000 × N |
| `createInvoice` (FHE encrypt) | ~450,000 |
| `reputationScore` (read) | ~25,000 |
| Re-encryption (off-chain) | 0 gas |

FHE operations are more expensive than plain EVM — this is the privacy premium. For payroll (monthly) and invoicing (per-project), the cost is negligible relative to transaction value.
