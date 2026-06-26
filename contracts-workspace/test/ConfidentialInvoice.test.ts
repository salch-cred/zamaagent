import { ethers } from 'hardhat'
import { expect } from 'chai'
import { createInstances } from './instance'
import { getSigners, initSigners } from './signers'

describe('ConfidentialInvoice', () => {
  before(async () => { await initSigners() })

  it('freelancer creates an invoice with encrypted amount', async () => {
    const signers   = await getSigners()
    const instances = await createInstances(signers)
    const factory   = await ethers.getContractFactory('ConfidentialInvoice')
    const contract  = await factory.connect(signers.alice).deploy()
    await contract.waitForDeployment()

    const contractAddress = await contract.getAddress()

    // Alice (freelancer) encrypts the invoice amount
    const input = instances.alice.createEncryptedInput(contractAddress, signers.alice.address)
    input.add64(1500_000000n) // 1500 cUSDT in micro
    const encrypted = await input.encrypt()

    const dueDate = Math.floor(Date.now() / 1000) + 86400 * 14 // 14 days

    const tx = await contract
      .connect(signers.alice)
      .createInvoice(
        signers.bob.address,
        encrypted.handles[0],
        encrypted.inputProof,
        'Full-stack development: API + dashboard',
        dueDate
      )
    await tx.wait()

    const ids = await contract.getFreelancerInvoices(signers.alice.address)
    expect(ids.length).to.equal(1)
    expect(ids[0]).to.equal(0n)
    console.log('✅ Invoice created with encrypted amount, ID:', ids[0])
  })

  it('client pays invoice', async () => {
    const signers   = await getSigners()
    const instances = await createInstances(signers)
    const factory   = await ethers.getContractFactory('ConfidentialInvoice')
    const contract  = await factory.connect(signers.alice).deploy()
    await contract.waitForDeployment()

    const contractAddress = await contract.getAddress()
    const input = instances.alice.createEncryptedInput(contractAddress, signers.alice.address)
    input.add64(500_000000n)
    const encrypted = await input.encrypt()
    const dueDate   = Math.floor(Date.now() / 1000) + 86400

    await (await contract.connect(signers.alice).createInvoice(
      signers.bob.address,
      encrypted.handles[0],
      encrypted.inputProof,
      'Logo design',
      dueDate
    )).wait()

    await (await contract.connect(signers.bob).payInvoice(0)).wait()
    const [isPaid] = await contract.getInvoiceStatus(0)
    expect(isPaid).to.equal(true)
    console.log('✅ Invoice paid successfully')
  })
})
