import { ethers } from 'hardhat'
import { expect } from 'chai'
import { createInstances } from './instance'
import { getSigners, initSigners } from './signers'

describe('ConfidentialAirdrop', () => {
  before(async () => { await initSigners() })

  async function deployFixture() {
    const signers  = await getSigners()
    const factory  = await ethers.getContractFactory('ConfidentialAirdrop')
    const contract = await factory.connect(signers.alice).deploy('PayMate Test Airdrop')
    await contract.waitForDeployment()
    return { signers, contract, addr: await contract.getAddress() }
  }

  it('deploys with campaign name and active state', async () => {
    const { signers, contract } = await deployFixture()
    expect(await contract.distributor()).to.equal(signers.alice.address)
    expect(await contract.campaignName()).to.equal('PayMate Test Airdrop')
    expect(await contract.isActive()).to.equal(true)
  })

  it('sets an allocation and registers the recipient', async () => {
    const { signers, contract, addr } = await deployFixture()
    const instances = await createInstances(signers)
    const input = instances.alice.createEncryptedInput(addr, signers.alice.address)
    input.add64(500n)
    const enc = await input.encrypt()
    await (await contract.setAllocation(signers.bob.address, enc.handles[0], enc.inputProof)).wait()
    expect(await contract.isRecipient(signers.bob.address)).to.equal(true)
    expect(await contract.getRecipientCount()).to.equal(1n)
  })

  it('rejects a non-distributor setting an allocation', async () => {
    const { signers, contract, addr } = await deployFixture()
    const instances = await createInstances(signers)
    const input = instances.bob.createEncryptedInput(addr, signers.bob.address)
    input.add64(500n)
    const enc = await input.encrypt()
    await expect(
      contract.connect(signers.bob).setAllocation(signers.carol.address, enc.handles[0], enc.inputProof)
    ).to.be.revertedWith('Not distributor')
  })

  it('rejects a batch with mismatched array lengths', async () => {
    const { signers, contract, addr } = await deployFixture()
    const instances = await createInstances(signers)
    const input = instances.alice.createEncryptedInput(addr, signers.alice.address)
    input.add64(100n)
    const enc = await input.encrypt()
    await expect(
      contract.batchSetAllocations(
        [signers.bob.address, signers.carol.address],
        [enc.handles[0]],
        [enc.inputProof]
      )
    ).to.be.revertedWith('Length mismatch')
  })

  it('lets a recipient claim once and rejects a second claim', async () => {
    const { signers, contract, addr } = await deployFixture()
    const instances = await createInstances(signers)
    const input = instances.alice.createEncryptedInput(addr, signers.alice.address)
    input.add64(500n)
    const enc = await input.encrypt()
    await (await contract.setAllocation(signers.bob.address, enc.handles[0], enc.inputProof)).wait()
    await (await contract.connect(signers.bob).claimAllocation()).wait()
    expect(await contract.hasClaimed(signers.bob.address)).to.equal(true)
    await expect(
      contract.connect(signers.bob).claimAllocation()
    ).to.be.revertedWith('Already claimed')
  })

  it('rejects a claim from a non-recipient', async () => {
    const { signers, contract } = await deployFixture()
    await expect(
      contract.connect(signers.bob).claimAllocation()
    ).to.be.revertedWith('Not a recipient')
  })

  it('closes the campaign and blocks new allocations', async () => {
    const { signers, contract, addr } = await deployFixture()
    await (await contract.closeCampaign()).wait()
    expect(await contract.isActive()).to.equal(false)
    const instances = await createInstances(signers)
    const input = instances.alice.createEncryptedInput(addr, signers.alice.address)
    input.add64(100n)
    const enc = await input.encrypt()
    await expect(
      contract.setAllocation(signers.bob.address, enc.handles[0], enc.inputProof)
    ).to.be.revertedWith('Campaign closed')
  })
})
