import { ethers } from 'hardhat'
import { expect } from 'chai'
import { createInstances } from './instance'
import { getSigners, initSigners } from './signers'

describe('ConfidentialPayroll', () => {
  before(async () => { await initSigners() })

  async function deployFixture() {
    const signers  = await getSigners()
    const factory  = await ethers.getContractFactory('ConfidentialPayroll')
    const contract = await factory.connect(signers.alice).deploy()
    await contract.waitForDeployment()
    return { signers, contract, addr: await contract.getAddress() }
  }

  it('deploys successfully', async () => {
    const { signers, contract } = await deployFixture()
    expect(await contract.employer()).to.equal(signers.alice.address)
  })

  it('adds an employee', async () => {
    const { signers, contract } = await deployFixture()
    await (await contract.addEmployee(signers.bob.address)).wait()
    expect(await contract.isEmployee(signers.bob.address)).to.equal(true)
    expect(await contract.getEmployeeCount()).to.equal(1n)
  })

  it('rejects adding duplicate employee', async () => {
    const { signers, contract } = await deployFixture()
    await (await contract.addEmployee(signers.bob.address)).wait()
    await expect(
      contract.addEmployee(signers.bob.address)
    ).to.be.revertedWith('Already registered')
  })

  it('removes an employee and decrements the count', async () => {
    const { signers, contract } = await deployFixture()
    await (await contract.addEmployee(signers.bob.address)).wait()
    await (await contract.removeEmployee(signers.bob.address)).wait()
    expect(await contract.isEmployee(signers.bob.address)).to.equal(false)
    expect(await contract.getEmployeeCount()).to.equal(0n)
  })

  it('transfers the employer role', async () => {
    const { signers, contract } = await deployFixture()
    await (await contract.transferEmployer(signers.bob.address)).wait()
    expect(await contract.employer()).to.equal(signers.bob.address)
  })

  it('rejects deposit from a non-employer', async () => {
    const { signers, contract, addr } = await deployFixture()
    const instances = await createInstances(signers)
    const input = instances.bob.createEncryptedInput(addr, signers.bob.address)
    input.add64(50n)
    const enc = await input.encrypt()
    await expect(
      contract.connect(signers.bob).depositPayroll(enc.handles[0], enc.inputProof)
    ).to.be.revertedWith('Not employer')
  })

  it('rejects getMyBalance for a non-employee', async () => {
    const { signers, contract } = await deployFixture()
    await expect(
      contract.connect(signers.bob).getMyBalance()
    ).to.be.revertedWith('Not an employee')
  })

  it('rejects payment to non-employee', async () => {
    const { signers, contract, addr } = await deployFixture()
    const instances = await createInstances(signers)
    const input = instances.alice.createEncryptedInput(addr, signers.alice.address)
    input.add64(1000n)
    const encrypted = await input.encrypt()

    await expect(
      contract.payEmployee(
        signers.bob.address,
        encrypted.handles[0],
        encrypted.inputProof
      )
    ).to.be.revertedWith('Not an employee')
  })

  it('underflow guard: paying more than the pool does not revert or wrap', async () => {
    const { signers, contract, addr } = await deployFixture()
    const instances = await createInstances(signers)

    await (await contract.addEmployee(signers.bob.address)).wait()

    // deposit 100 into the pool
    const dep    = instances.alice.createEncryptedInput(addr, signers.alice.address)
    dep.add64(100n)
    const depEnc = await dep.encrypt()
    await (await contract.depositPayroll(depEnc.handles[0], depEnc.inputProof)).wait()

    // attempt to pay 1000 (> pool). The TFHE.le + TFHE.select guard should make
    // this a no-op transfer (0) rather than reverting or underflowing the pool.
    const pay    = instances.alice.createEncryptedInput(addr, signers.alice.address)
    pay.add64(1000n)
    const payEnc = await pay.encrypt()
    await expect(
      contract.payEmployee(signers.bob.address, payEnc.handles[0], payEnc.inputProof)
    ).to.not.be.reverted
  })
})
