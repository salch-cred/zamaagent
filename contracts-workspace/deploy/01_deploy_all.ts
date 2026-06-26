import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts()
  const { deploy }   = hre.deployments

  console.log('\n🚀 Deploying PayMate contracts to', hre.network.name, '...')
  console.log('👤 Deployer:', deployer)

  // 1. ConfidentialPayroll
  const payroll = await deploy('ConfidentialPayroll', {
    from:    deployer,
    args:    [],
    log:     true,
    gasLimit: 3_000_000,
  })
  console.log('\n✅ ConfidentialPayroll:', payroll.address)

  // 2. ConfidentialInvoice
  const invoice = await deploy('ConfidentialInvoice', {
    from:    deployer,
    args:    [],
    log:     true,
    gasLimit: 3_000_000,
  })
  console.log('✅ ConfidentialInvoice:', invoice.address)

  // 3. ConfidentialAirdrop
  const airdrop = await deploy('ConfidentialAirdrop', {
    from:    deployer,
    args:    ['PayMate Season 3 Airdrop'],
    log:     true,
    gasLimit: 3_000_000,
  })
  console.log('✅ ConfidentialAirdrop:', airdrop.address)

  console.log('\n📝 Copy these addresses into your frontend .env.local:')
  console.log(`NEXT_PUBLIC_PAYROLL_ADDRESS=${payroll.address}`)
  console.log(`NEXT_PUBLIC_INVOICE_ADDRESS=${invoice.address}`)
  console.log(`NEXT_PUBLIC_AIRDROP_ADDRESS=${airdrop.address}`)
}

func.tags = ['PayMate']
export default func
