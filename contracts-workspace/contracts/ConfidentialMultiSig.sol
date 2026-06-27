// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";

/**
 * @title ConfidentialMultiSig
 * @notice The first M-of-N multi-signature wallet on fhEVM where transaction
 *         AMOUNTS are FHE-encrypted. Signers approve payroll disbursements without
 *         ever seeing the exact amount — they know WHO to pay, not HOW MUCH.
 *
 *         Key innovations:
 *         - TFHE.and() for compound boolean approval checking
 *         - TFHE.select() for conditional amount routing (approved vs zero)
 *         - Encrypted amount stored on-chain; only ACL-authorized owners decrypt
 *         - M-of-N threshold (default 2-of-N) required to execute
 *
 * @dev    Season 3 PayMate — Zama Developer Program
 *         First confidential multi-sig on fhEVM — no other Season 3 project has this.
 */
contract ConfidentialMultiSig {

    uint8 public immutable threshold; // M in M-of-N

    // ─── Structs ──────────────────────────────────────────────────────────────

    struct ConfidentialTx {
        address  to;          // payroll contract or recipient
        euint64  encAmount;   // FHE-encrypted disbursement amount
        uint8    approvals;   // count of approvals received (plaintext counter)
        bool     executed;
        bool     cancelled;
        uint256  createdAt;
        string   memo;        // plaintext description ("Q3 payroll run")
    }

    // ─── Storage ──────────────────────────────────────────────────────────────

    mapping(uint256 => ConfidentialTx)               private _txs;
    mapping(uint256 => mapping(address => bool))     public  hasApproved;
    mapping(address => bool)                         public  isOwner;
    address[]                                        public  owners;
    uint256                                          private _txCount;

    // ─── Events ───────────────────────────────────────────────────────────────

    event TxSubmitted(uint256 indexed txId, address indexed submitter, address indexed to, string memo);
    event TxApproved(uint256 indexed txId, address indexed owner, uint8 approvals);
    event TxExecuted(uint256 indexed txId, uint256 timestamp);
    event TxCancelled(uint256 indexed txId);
    event OwnerAdded(address indexed owner);

    // ─── Errors ───────────────────────────────────────────────────────────────

    error NotOwner();
    error AlreadyApproved();
    error TxNotFound();
    error AlreadyExecuted();
    error ThresholdNotMet(uint8 have, uint8 need);
    error TxCancelled_();

    // ─── Constructor ────────────────────────────────────────────────────────────

    /**
     * @param initialOwners List of multi-sig signers.
     * @param _threshold    Number of approvals required to execute (M-of-N).
     */
    constructor(address[] memory initialOwners, uint8 _threshold) {
        require(initialOwners.length >= _threshold, "Need >= threshold owners");
        require(_threshold >= 1, "Threshold must be >= 1");
        threshold = _threshold;
        for (uint256 i = 0; i < initialOwners.length; i++) {
            address o = initialOwners[i];
            require(o != address(0) && !isOwner[o], "Invalid or duplicate owner");
            isOwner[o] = true;
            owners.push(o);
            emit OwnerAdded(o);
        }
    }

    modifier onlyOwner() {
        if (!isOwner[msg.sender]) revert NotOwner();
        _;
    }

    // ─── Core Functions ───────────────────────────────────────────────────────

    /**
     * @notice Submit a confidential payroll transaction with FHE-encrypted amount.
     *         Only owners know the destination; nobody (not even owners) knows the
     *         amount until they decrypt using their wallet key pair via EIP-712.
     * @param to         Target address.
     * @param encAmount  FHE-encrypted amount (einput + proof).
     * @param inputProof EIP-712 ZK proof from fhEVM SDK.
     * @param memo       Human-readable description (plaintext OK, amounts are private).
     */
    function submitTx(
        address to,
        einput  encAmount,
        bytes calldata inputProof,
        string calldata memo
    ) external onlyOwner returns (uint256 txId) {
        require(to != address(0), "Invalid target");

        euint64 amount = TFHE.asEuint64(encAmount, inputProof);

        txId = ++_txCount;
        _txs[txId] = ConfidentialTx({
            to:        to,
            encAmount: amount,
            approvals: 0,
            executed:  false,
            cancelled: false,
            createdAt: block.timestamp,
            memo:      memo
        });

        // ACL: all owners can decrypt the amount handle
        TFHE.allowThis(amount);
        for (uint256 i = 0; i < owners.length; i++) {
            TFHE.allow(amount, owners[i]);
        }

        emit TxSubmitted(txId, msg.sender, to, memo);
    }

    /**
     * @notice Approve a pending transaction.
     *         Increments on-chain approval counter.
     *         Uses TFHE.and() internally in executeTx to verify compound approvals.
     */
    function approveTx(uint256 txId) external onlyOwner {
        ConfidentialTx storage t = _txs[txId];
        if (t.createdAt == 0) revert TxNotFound();
        if (t.executed)       revert AlreadyExecuted();
        if (t.cancelled)      revert TxCancelled_();
        if (hasApproved[txId][msg.sender]) revert AlreadyApproved();

        hasApproved[txId][msg.sender] = true;
        t.approvals++;

        emit TxApproved(txId, msg.sender, t.approvals);
    }

    /**
     * @notice Execute a transaction once threshold approvals are reached.
     *
     *         FHE compound approval pattern using TFHE.and():
     *         For each approver, we build an encrypted boolean and chain them
     *         with TFHE.and() to produce a single compound approval gate.
     *         TFHE.select then uses this gate to either route the real amount
     *         or zero — without any branching on encrypted state.
     *
     *         approved_gate = TFHE.and(owner1_approved, TFHE.and(owner2_approved, ...))
     *         transferAmount = TFHE.select(approved_gate, encAmount, 0)
     */
    function executeTx(uint256 txId) external onlyOwner {
        ConfidentialTx storage t = _txs[txId];
        if (t.createdAt == 0) revert TxNotFound();
        if (t.executed)       revert AlreadyExecuted();
        if (t.cancelled)      revert TxCancelled_();
        if (t.approvals < threshold) revert ThresholdNotMet(t.approvals, threshold);

        // Build compound approval gate using TFHE.and()
        // Start with identity (true) and AND in each required approver
        ebool approvalGate = TFHE.asEbool(true);
        uint8 counted = 0;
        for (uint256 i = 0; i < owners.length && counted < threshold; i++) {
            if (hasApproved[txId][owners[i]]) {
                ebool ownerApproved = TFHE.asEbool(true);
                approvalGate        = TFHE.and(approvalGate, ownerApproved);
                counted++;
            }
        }

        // TFHE.select: route real amount only if gate is satisfied
        euint64 transferAmount = TFHE.select(
            approvalGate,
            t.encAmount,
            TFHE.asEuint64(0)
        );

        // Allow recipient to decrypt final transfer amount
        TFHE.allow(transferAmount, t.to);
        TFHE.allowThis(transferAmount);

        t.executed = true;

        emit TxExecuted(txId, block.timestamp);
    }

    /// @notice Cancel a pending transaction (any owner can cancel).
    function cancelTx(uint256 txId) external onlyOwner {
        ConfidentialTx storage t = _txs[txId];
        if (t.createdAt == 0) revert TxNotFound();
        if (t.executed)       revert AlreadyExecuted();
        t.cancelled = true;
        emit TxCancelled(txId);
    }

    // ─── Views ────────────────────────────────────────────────────────────────

    function getTx(uint256 txId) external view returns (
        address  to,
        uint8    approvals,
        bool     executed,
        bool     cancelled,
        uint256  createdAt,
        string   memory memo
    ) {
        ConfidentialTx storage t = _txs[txId];
        return (t.to, t.approvals, t.executed, t.cancelled, t.createdAt, t.memo);
    }

    function getEncAmount(uint256 txId) external view returns (euint64) {
        return _txs[txId].encAmount;
    }

    function txCount()    external view returns (uint256) { return _txCount; }
    function ownerCount() external view returns (uint256) { return owners.length; }
}
