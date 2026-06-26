# Security Policy

PayMate is a confidential payments platform built on the Zama fhEVM. This
document describes the security model, the FHE access-control design, and how
to report vulnerabilities.

## Reporting a vulnerability

Please open a private security advisory on GitHub, or email the maintainer.
Do **not** open a public issue for an exploitable vulnerability.

## FHE access-control model

All monetary amounts are stored on-chain as `euint64` ciphertexts. Plaintext
values never touch the chain. Access to decrypt a given ciphertext is granted
explicitly via the fhEVM ACL:

| Contract | Encrypted value | Who can decrypt |
| --- | --- | --- |
| `ConfidentialInvoice` | invoice `amount` | freelancer + client only (`TFHE.allow`) |
| `ConfidentialPayroll` | employee `encryptedBalance` | that employee + employer |
| `ConfidentialPayroll` | `totalPool` | employer only |
| `ConfidentialAirdrop` | per-recipient `allocation` | that recipient + distributor |

Reading an amount is a two-step flow: a `view` returns the ciphertext handle,
then the caller re-encrypts it to their own key via an EIP-712 signature and
decrypts client-side (`lib/fhevm.ts`). The chain never reveals plaintext.

## Known FHE-specific risks and mitigations

- **Encrypted integer underflow.** FHE arithmetic does **not** revert on
  underflow; `TFHE.sub` wraps a `euint64` around to a huge value. Mitigated in
  `ConfidentialPayroll.payEmployee` with an encrypted `TFHE.le` guard +
  `TFHE.select` so the pool can never be drained below zero.
- **ACL leakage.** Every state-mutating path re-asserts `TFHE.allowThis` plus
  the per-user `TFHE.allow` grants so a recomputed ciphertext stays readable
  only by the intended parties.
- **Settlement is stubbed.** `payInvoice` / `claimAllocation` currently flip
  status flags rather than moving an ERC-7984 confidential token. This is a
  testnet/demo limitation, documented so it is not mistaken for a transfer.

## Operational security

- Secrets (`.env`, `.env.local`, deployer private keys) are gitignored and
  must never be committed. Only `NEXT_PUBLIC_*` values reach the browser, and
  none of those are secrets.
- Contracts target the Sepolia testnet only. Do not deploy to mainnet without
  a full audit.

## Supported versions

This is a hackathon/testnet project. Only the latest `main` is supported.
