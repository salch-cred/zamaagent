import { ethers } from 'hardhat'
import { expect } from 'chai'
import { createInstances } from './instance'
import { getSigners, initSigners } from './signers'

describe('ConfidentialPayroll', () => {
  before(async () => { await initSigners() })

  it('deploys successfully', async () => {
    const signers = await getSigners()
    const factory = await ethers.getContractFactory('ConfidentialPayroll')
    const contract = await factory.connect(signers.alice).deploy()
    await contract.waitForDeployment()
    expect(await contract.employer()).to.equal(signers.alice.address)
    console.log('✅ Deployed at:', await contract.getAddress())
  })

  it('adds an employee', async () => {
    const signers  = await getSigners()
    const factory  = await ethers.getContractFactory('ConfidentialPayroll')
    const contract = await factory.connect(signers.alice).deploy()
    await contract.waitForDeployment()

    await contract.addEmployee(signers.bob.address)
    expect(await contract.isEmployee(signers.bob.address)).to.equal(true)
    expect(await contract.getEmployeeCount()).to.equal(1n)
    console.log('✅ Employee added:', signers.bob.address)
  })

  it('rejects adding duplicate employee', async () => {
    const signers  = await getSigners()
    const factory  = await ethers.getContractFactory('ConfidentialPayroll')
    const contract = await factory.connect(signers.alice).deploy()
    await contract.waitForDeployment()

    await contract.addEmployee(signers.bob.address)
    await expect(
      contract.addEmployee(signers.bob.address)
    ).to.be.revertedWith('Already registered')
    console.log('✅ Duplicate rejection works')
  })

  it('rejects payment to non-employee', async () => {
    const signers   = await getSigners()
    const instances = await createInstances(signers)
    const factory   = await ethers.getContractFactory('ConfidentialPayroll')
    const contract  = await factory.connect(signers.alice).deploy()
    await contract.waitForDeployment()

    const contractAddress = await contract.getAddress()
    const input = instances.alice.createEncryptedInput(contractAddress, signers.alice.address)
    input.add64(1000n)
    const encrypted = await input.encrypt()

    await expect(
      contract.payEmployee(
        signers.bob.address,
        encrypted.handles[0],
        encrypted.inputProof
      )
    ).to.be.revertedWith('Not an employee')
    console.log('✅ Non-employee rejection works')
  })
})
