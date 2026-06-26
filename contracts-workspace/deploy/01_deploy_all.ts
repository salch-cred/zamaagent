import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts()
  const { deploy, execute } = hre.deployments

  console.log('\n\u{1F680} Deploying PayMate contracts to', hre.network.name, '...')
  console.log('\u{1F464} Deployer:', deployer)

  // 1. ConfidentialPayroll
  const payroll = await deploy('ConfidentialPayroll', {
    from:    deployer,
    args:    [],
    log:     true,
    gasLimit: 3_000_000,
  })
  console.log('\n\u2705 ConfidentialPayroll:', payroll.address)

  // 2. ConfidentialInvoice
  const invoice = await deploy('ConfidentialInvoice', {
    from:    deployer,
    args:    [],
    log:     true,
    gasLimit: 3_000_000,
  })
  console.log('\u2705 ConfidentialInvoice:', invoice.address)

  // 3. ConfidentialAirdrop
  const airdrop = await deploy('ConfidentialAirdrop', {
    from:    deployer,
    args:    ['PayMate Season 3 Airdrop'],
    log:     true,
    gasLimit: 3_000_000,
  })
  console.log('\u2705 ConfidentialAirdrop:', airdrop.address)

  // 4. ReputationRegistry
  const reputation = await deploy('ReputationRegistry', {
    from:    deployer,
    args:    [],
    log:     true,
    gasLimit: 3_000_000,
  })
  console.log('\u2705 ReputationRegistry:', reputation.address)

  // Authorize the invoice contract to mint reputation credentials.
  await execute(
    'ReputationRegistry',
    { from: deployer, log: true },
    'setInvoiceContract',
    invoice.address
  )
  console.log('\u{1F517} Linked ReputationRegistry -> ConfidentialInvoice')

  console.log('\n\u{1F4DD} Copy these addresses into your frontend .env.local:')
  console.log('NEXT_PUBLIC_PAYROLL_ADDRESS=' + payroll.address)
  console.log('NEXT_PUBLIC_INVOICE_ADDRESS=' + invoice.address)
  console.log('NEXT_PUBLIC_AIRDROP_ADDRESS=' + airdrop.address)
  console.log('NEXT_PUBLIC_REPUTATION_ADDRESS=' + reputation.address)
}

func.tags = ['PayMate']
export default func
