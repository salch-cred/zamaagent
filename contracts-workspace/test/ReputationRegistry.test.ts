import { ethers } from 'hardhat'
import { expect } from 'chai'
import { getSigners, initSigners } from './signers'

describe('ReputationRegistry', () => {
  before(async () => { await initSigners() })

  async function deployFixture() {
    const signers  = await getSigners()
    const factory  = await ethers.getContractFactory('ReputationRegistry')
    const contract = await factory.connect(signers.alice).deploy()
    await contract.waitForDeployment()
    return { signers, contract }
  }

  it('deploys with the owner set to the deployer', async () => {
    const { signers, contract } = await deployFixture()
    expect(await contract.owner()).to.equal(signers.alice.address)
  })

  it('owner issues a credential and completedJobs increments', async () => {
    const { signers, contract } = await deployFixture()
    await (await contract.issueCredential(
      signers.bob.address, signers.carol.address, 0, 'Smart Contract Audit'
    )).wait()
    expect(await contract.completedJobs(signers.bob.address)).to.equal(1n)
    const ids = await contract.getCredentials(signers.bob.address)
    expect(ids.length).to.equal(1)
  })

  it('reputationScore is 0 with no jobs and 1000 with one clean job', async () => {
    const { signers, contract } = await deployFixture()
    expect(await contract.reputationScore(signers.bob.address)).to.equal(0n)
    await (await contract.issueCredential(
      signers.bob.address, signers.carol.address, 0, 'Job'
    )).wait()
    expect(await contract.reputationScore(signers.bob.address)).to.equal(1000n)
  })

  it('disputes lower the reputation score', async () => {
    const { signers, contract } = await deployFixture()
    await (await contract.issueCredential(
      signers.bob.address, signers.carol.address, 0, 'Job'
    )).wait()
    await (await contract.recordDispute(signers.bob.address)).wait()
    // jobs=1, disputes=1 => 1000 * 1 / (1 + 2) = 333
    expect(await contract.reputationScore(signers.bob.address)).to.equal(333n)
  })

  it('revoking a credential decrements completedJobs', async () => {
    const { signers, contract } = await deployFixture()
    await (await contract.issueCredential(
      signers.bob.address, signers.carol.address, 0, 'Job'
    )).wait()
    await (await contract.revokeCredential(0)).wait()
    expect(await contract.completedJobs(signers.bob.address)).to.equal(0n)
    const cred = await contract.getCredential(0)
    expect(cred.revoked).to.equal(true)
  })

  it('rejects an unauthorized issuer', async () => {
    const { signers, contract } = await deployFixture()
    await expect(
      contract.connect(signers.bob).issueCredential(
        signers.bob.address, signers.carol.address, 0, 'Job'
      )
    ).to.be.revertedWith('Not authorized')
  })

  it('authorizes the invoice contract to issue credentials', async () => {
    const { signers, contract } = await deployFixture()
    await (await contract.setInvoiceContract(signers.dave.address)).wait()
    await (await contract.connect(signers.dave).issueCredential(
      signers.bob.address, signers.carol.address, 0, 'Job'
    )).wait()
    expect(await contract.completedJobs(signers.bob.address)).to.equal(1n)
  })

  it('transfers ownership', async () => {
    const { signers, contract } = await deployFixture()
    await (await contract.transferOwnership(signers.bob.address)).wait()
    expect(await contract.owner()).to.equal(signers.bob.address)
  })
})
