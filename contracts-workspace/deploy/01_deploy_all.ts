import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

/**
 * PayMate — Full Deployment Script
 * Deploys all 6 contracts + wires cross-contract references.
 * Season 3 Zama Developer Program
 */
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts()
  const { deploy, execute, get } = hre.deployments
  const [deployerSigner] = await hre.ethers.getSigners()

  console.log('\n\u{1F680} Deploying PayMate (6 contracts) to', hre.network.name, '...')
  console.log('\u{1F464} Deployer:', deployer)

  // ─── 1. ConfidentialPayroll ───────────────────────────────────────────────
  const payroll = await deploy('ConfidentialPayroll', {
    from:     deployer,
    args:     [],
    log:      true,
    gasLimit: 4_000_000,
  })
  console.log('\n\u2705 ConfidentialPayroll:', payroll.address)

  // ─── 2. ConfidentialInvoice ───────────────────────────────────────────────
  const invoice = await deploy('ConfidentialInvoice', {
    from:     deployer,
    args:     [],
    log:      true,
    gasLimit: 4_000_000,
  })
  console.log('\u2705 ConfidentialInvoice:', invoice.address)

  // ─── 3. ConfidentialAirdrop ───────────────────────────────────────────────
  const airdrop = await deploy('ConfidentialAirdrop', {
    from:     deployer,
    args:     ['PayMate Season 3 Airdrop'],
    log:      true,
    gasLimit: 3_000_000,
  })
  console.log('\u2705 ConfidentialAirdrop:', airdrop.address)

  // ─── 4. ReputationRegistry ───────────────────────────────────────────────
  const reputation = await deploy('ReputationRegistry', {
    from:     deployer,
    args:     [],
    log:      true,
    gasLimit: 3_000_000,
  })
  console.log('\u2705 ReputationRegistry:', reputation.address)

  // ─── 5. ConfidentialVestingWallet ─────────────────────────────────────────
  const vesting = await deploy('ConfidentialVestingWallet', {
    from:     deployer,
    args:     [],
    log:      true,
    gasLimit: 4_000_000,
  })
  console.log('\u2705 ConfidentialVestingWallet:', vesting.address)

  // ─── 6. ConfidentialMultiSig (2-of-3 with deployer) ──────────────────────
  // Deploy with deployer as the sole initial owner; add co-signers post-deploy
  // or replace owners via governance. Default threshold = 2-of-3.
  const owner2 = process.env.MULTISIG_OWNER2 || deployer
  const owner3 = process.env.MULTISIG_OWNER3 || deployer
  const msig = await deploy('ConfidentialMultiSig', {
    from:     deployer,
    args:     [[deployer, owner2, owner3], 2],
    log:      true,
    gasLimit: 3_000_000,
  })
  console.log('\u2705 ConfidentialMultiSig (2-of-3):', msig.address)

  // ─── Wire cross-contract references ──────────────────────────────────────
  await execute(
    'ReputationRegistry',
    { from: deployer, log: true },
    'setInvoiceContract',
    invoice.address
  )
  console.log('\u{1F517} Linked ReputationRegistry \u2192 ConfidentialInvoice')

  // ─── Print env vars ───────────────────────────────────────────────────────
  console.log('\n\u{1F4DD} Copy these into .env.local:')
  console.log('NEXT_PUBLIC_PAYROLL_ADDRESS='  + payroll.address)
  console.log('NEXT_PUBLIC_INVOICE_ADDRESS='  + invoice.address)
  console.log('NEXT_PUBLIC_AIRDROP_ADDRESS='  + airdrop.address)
  console.log('NEXT_PUBLIC_REPUTATION_ADDRESS=' + reputation.address)
  console.log('NEXT_PUBLIC_VESTING_ADDRESS='  + vesting.address)
  console.log('NEXT_PUBLIC_MULTISIG_ADDRESS=' + msig.address)
  console.log('\n\u{1F3C6} 6 contracts deployed. Submit to Zama by July 07 2026.')
}

func.tags = ['PayMate']
export default func
