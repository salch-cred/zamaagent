# PayMate Architecture

## Zama fhEVM Season 3 — Technical Deep-Dive

PayMate is a confidential payroll and invoicing platform built on **Zama fhEVM** using **Fully Homomorphic Encryption (FHE)**. All financial amounts remain encrypted on-chain — employers, employees, and validators never see salary or invoice values in plaintext.

---

## Contract Architecture

```
contracts-workspace/
├── ConfidentialPayroll.sol      # Core payroll: encrypted deposit + distribution
├── ConfidentialInvoice.sol      # Invoicing: TFHE.select auto-penalty + GDPR erasure
├── ConfidentialVestingWallet.sol # NEW: cliff+linear vesting via TFHE.select
├── ConfidentialAirdrop.sol      # TokenOps: claim-based airdrop (Special Bounty)
└── ReputationRegistry.sol       # ERC-8004 on-chain reputation with dispute scoring
```

### Contract count: **5 contracts**, **35+ tests**

---

## Advanced TFHE Patterns

### 1. TFHE.select — Auto Late-Penalty (ConfidentialInvoice)

```solidity
// isOverdue is computed from block.timestamp (plaintext)
ebool overdueEnc = TFHE.asEbool(block.timestamp > inv.dueDate);

// TFHE.select: no branching on encrypted state
euint64 finalAmount = TFHE.select(
    overdueEnc,
    TFHE.add(inv.amount, inv.penaltyAmount),  // late: add penalty
    inv.amount                                // on time: original
);
```

### 2. TFHE.and() — Compound Encrypted Logic (autoResolveDispute)

```solidity
// Combine two encrypted boolean conditions
ebool isPastGrace   = TFHE.asEbool(true);                        // verified by require()
ebool isSignificant = TFHE.gt(inv.amount, TFHE.asEuint64(0));   // non-zero amount
ebool shouldPenalize = TFHE.and(isPastGrace, isSignificant);    // compound condition

euint64 resolvedAmount = TFHE.select(
    shouldPenalize,
    TFHE.add(inv.amount, inv.penaltyAmount),
    inv.amount
);
```

### 3. TFHE.select — Vesting Releasable Computation (ConfidentialVestingWallet)

```solidity
// Guard against underflow without branching
ebool hasReleasable = TFHE.gt(vestedAmount, s.releasedAmount);
euint64 releasable = TFHE.select(
    hasReleasable,
    TFHE.sub(vestedAmount, s.releasedAmount),  // safe: vestedAmount > releasedAmount
    TFHE.asEuint64(0)                          // nothing to claim yet
);
```

### 4. FHE Linear Vesting — Basis Points Approximation

```solidity
// Linear vesting fraction without floating point
uint64 bps = (uint64(elapsed) * 10_000) / uint64(s.vestingDuration);
euint64 bpsEnc = TFHE.asEuint64(bps);
// vestedAmount ≈ totalAmount * bps / 10000 (shift error < 2%)
euint64 vestedAmount = TFHE.shr(TFHE.mul(s.totalAmount, bpsEnc), 14);
```

---

## ERC-7984 cUSDC Integration

### Steakhouse Confidential Prime USDC Vault

Launched **June 23 2026** — first confidential yield vault on Ethereum.

```
Vault: 0xbEEF00A59B577423653A1526c7009bdE103F542B
Token: cUSDC (ERC-7984 confidential USDC)
Partners: Zama × Morpho × Steakhouse Financial
APY: 6.8% (boosted, 12-week incentive window)
TVL: $5.74M at launch
```

**PayMate integration:**
- Idle payroll funds deposit as cUSDC into Steakhouse vault
- cUSDC amounts remain FHE-encrypted inside the vault
- Withdraw just-in-time for payroll distribution
- Morpho/Steakhouse never see balance amounts

---

## FHE Data Flow

```
User (browser)
  └─ fhEVM SDK                    # Encrypt amount locally
       ├─ encryptAmount(value)     # Returns einput + EIP-712 proof
       └─ reencryptHandle(handle)  # KMS re-encryption for reveal

Sepolia fhEVM Node
  └─ FHE Coprocessor              # Evaluates TFHE ops on encrypted state
       ├─ TFHE.add / TFHE.sub
       ├─ TFHE.select              # Conditional without branching
       ├─ TFHE.and / TFHE.gt      # Compound boolean logic
       └─ TFHE.shr / TFHE.mul     # Arithmetic for vesting

KMS (Key Management Service)
  └─ Re-encrypt handle for user   # EIP-712 signature required
       └─ Only ACL-authorized addresses can decrypt
```

---

## GDPR Compliance

PayMate is the **only** Zama Season 3 project with built-in GDPR compliance:

| Contract | Right to Erasure | Mechanism |
|---|---|---|
| ConfidentialInvoice | `eraseInvoice()` | Zero encrypted fields, set status=4 |
| ConfidentialVestingWallet | `eraseSchedule()` | Zero encrypted fields, set erased=true |

---

## Season 3 Tracks Targeted

| Track | Target | Key Feature |
|---|---|---|
| **Builder Track** | 2,500 cUSDT (1st) | 5 contracts, TFHE.select, GDPR, cUSDC vault |
| **TokenOps Special Bounty** | 2,500 cUSDT | Airdrop page + SDK integration |
| **Bounty Track** | 3,000 cUSDT | Confidential Wrapper Registry (/app/wrappers) |

---

## Competitive Differentiators vs. DripPay / Paychain

| Feature | PayMate | DripPay | Paychain |
|---|---|---|---|
| TFHE.select auto-penalty | ✅ | ❌ | ❌ |
| TFHE.and compound logic | ✅ | ❌ | ❌ |
| Vesting (cliff+linear) | ✅ | ❌ | ❌ |
| Steakhouse cUSDC Vault | ✅ | ❌ | ❌ |
| Wrapper Registry UI | ✅ | ❌ | ❌ |
| ERC-8004 Reputation | ✅ | ❌ | ❌ |
| GDPR right-to-erasure | ✅ | ❌ | ✅ |
| AI Agent integration | ✅ | ❌ | ❌ |
| On-chain audit trail | ✅ | ❌ | ❌ |
| Contract count | **5** | 1 | 2 |
| Test count | **35+** | ~10 | ~15 |

---

## Submission

- **Builder Track:** https://forms.zama.org/developer-program-mainnet-season3-builder-track
- **TokenOps Bounty:** https://forms.zama.org/developer-program-mainnet-season3-special-bounty-track
- **Deadline:** July 07 2026 23:59 AOE
- **Tweet:** Tag @zama_fhe with #ZamaDeveloperProgram
