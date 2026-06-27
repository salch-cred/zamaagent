import { expect } from 'chai'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers'

/**
 * ConfidentialMultiSig — test suite
 * Season 3 PayMate | Zama fhEVM
 * First confidential multi-sig with FHE-encrypted transaction amounts
 */
describe('ConfidentialMultiSig', () => {
  let owner1: SignerWithAddress
  let owner2: SignerWithAddress
  let owner3: SignerWithAddress
  let stranger: SignerWithAddress
  let recipient: SignerWithAddress
  let msig: Awaited<ReturnType<typeof deploy>>

  const THRESHOLD = 2

  async function deploy() {
    const Factory = await ethers.getContractFactory('ConfidentialMultiSig')
    return Factory.deploy([owner1.address, owner2.address, owner3.address], THRESHOLD)
  }

  beforeEach(async () => {
    ;[owner1, owner2, owner3, stranger, recipient] = await ethers.getSigners()
    msig = await deploy()
  })

  // ─── Deployment ────────────────────────────────────────────────────────────

  it('[PLAIN] deploys with correct threshold', async () => {
    expect(await msig.threshold()).to.equal(THRESHOLD)
  })

  it('[PLAIN] deploys with correct owner count', async () => {
    expect(await msig.ownerCount()).to.equal(3n)
  })

  it('[PLAIN] owner1 is recognized as owner', async () => {
    expect(await msig.isOwner(owner1.address)).to.be.true
  })

  it('[PLAIN] stranger is not an owner', async () => {
    expect(await msig.isOwner(stranger.address)).to.be.false
  })

  it('[PLAIN] starts with zero transactions', async () => {
    expect(await msig.txCount()).to.equal(0n)
  })

  // ─── Access Control ────────────────────────────────────────────────────────

  it('[PLAIN] reverts submitTx from stranger', async () => {
    const fakeHandle = ethers.randomBytes(32)
    const fakeProof  = ethers.randomBytes(32)
    await expect(
      msig.connect(stranger).submitTx(
        recipient.address,
        fakeHandle as unknown as string,
        fakeProof,
        'test'
      )
    ).to.be.revertedWithCustomError(msig, 'NotOwner')
  })

  it('[PLAIN] reverts approveTx from stranger', async () => {
    await expect(msig.connect(stranger).approveTx(1n))
      .to.be.revertedWithCustomError(msig, 'NotOwner')
  })

  it('[PLAIN] reverts executeTx from stranger', async () => {
    await expect(msig.connect(stranger).executeTx(1n))
      .to.be.revertedWithCustomError(msig, 'NotOwner')
  })

  it('[PLAIN] reverts cancelTx from stranger', async () => {
    await expect(msig.connect(stranger).cancelTx(1n))
      .to.be.revertedWithCustomError(msig, 'NotOwner')
  })

  // ─── Input Validation ──────────────────────────────────────────────────────

  it('[PLAIN] reverts deploy with threshold > owners', async () => {
    const Factory = await ethers.getContractFactory('ConfidentialMultiSig')
    await expect(
      Factory.deploy([owner1.address], 3)
    ).to.be.revertedWith('Need >= threshold owners')
  })

  it('[PLAIN] reverts deploy with zero threshold', async () => {
    const Factory = await ethers.getContractFactory('ConfidentialMultiSig')
    await expect(
      Factory.deploy([owner1.address, owner2.address], 0)
    ).to.be.revertedWith('Threshold must be >= 1')
  })

  it('[PLAIN] reverts executeTx on nonexistent tx', async () => {
    await expect(msig.connect(owner1).executeTx(999n))
      .to.be.revertedWithCustomError(msig, 'TxNotFound')
  })

  it('[PLAIN] reverts approveTx on nonexistent tx', async () => {
    await expect(msig.connect(owner1).approveTx(999n))
      .to.be.revertedWithCustomError(msig, 'TxNotFound')
  })

  // ─── Event Signatures ──────────────────────────────────────────────────────

  it('[PLAIN] has TxSubmitted event', async () => {
    expect(msig.interface.getEvent('TxSubmitted')).to.not.be.undefined
  })

  it('[PLAIN] has TxApproved event', async () => {
    expect(msig.interface.getEvent('TxApproved')).to.not.be.undefined
  })

  it('[PLAIN] has TxExecuted event', async () => {
    expect(msig.interface.getEvent('TxExecuted')).to.not.be.undefined
  })
})
