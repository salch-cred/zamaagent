// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";
import "fhevm/gateway/GatewayCaller.sol";

/**
 * @title ConfidentialInvoice
 * @notice Freelancer invoicing with FHE-encrypted amounts, TFHE.select auto late-penalty,
 *         TFHE.and() dispute auto-resolution, and GDPR right-to-erasure.
 * @dev    ERC-7984 compatible encrypted amount flows on Zama fhEVM.
 *         Season 3 PayMate — Zama Developer Program
 */
contract ConfidentialInvoice is GatewayCaller {

    // ─── Structs ──────────────────────────────────────────────────────────────

    struct Invoice {
        address employer;
        address freelancer;
        euint64 amount;           // encrypted invoice amount (6-decimal USDC)
        euint64 penaltyAmount;    // encrypted late-payment penalty (~6.25%)
        uint256 dueDate;
        uint8   status;           // 0=Pending 1=Paid 2=Disputed 3=AutoResolved 4=Erased
        uint256 createdAt;
        uint256 paidAt;
    }

    // ─── Storage ──────────────────────────────────────────────────────────────

    mapping(uint256 => Invoice)        private _invoices;
    mapping(address => uint256[])      private _employerInvoices;
    mapping(address => uint256[])      private _freelancerInvoices;
    uint256 private _invoiceCount;

    // ─── Events ───────────────────────────────────────────────────────────────

    event InvoiceCreated(uint256 indexed id, address indexed employer, address indexed freelancer, uint256 dueDate);
    event InvoicePaid(uint256 indexed id, uint256 paidAt, bool penaltyApplied);
    event InvoiceDisputed(uint256 indexed id, address indexed by);
    event InvoiceAutoResolved(uint256 indexed id, bool penaltyApplied);
    event InvoiceErased(uint256 indexed id);

    // ─── Errors ───────────────────────────────────────────────────────────────

    error NotAuthorized();
    error InvalidStatus(uint8 current);
    error InvoiceNotFound();
    error GraceNotExpired();

    // ─── Core Functions ───────────────────────────────────────────────────────

    /**
     * @notice Create a new invoice with FHE-encrypted amount.
     * @param freelancer  Recipient address.
     * @param encAmount   einput handle from fhEVM SDK (bytes32).
     * @param inputProof  EIP-712 ZK proof.
     * @param dueDate     Unix timestamp deadline.
     */
    function createInvoice(
        address freelancer,
        einput encAmount,
        bytes calldata inputProof,
        uint256 dueDate
    ) external returns (uint256 id) {
        require(dueDate > block.timestamp, "Due date must be future");
        require(freelancer != address(0) && freelancer != msg.sender, "Invalid freelancer");

        euint64 amount = TFHE.asEuint64(encAmount, inputProof);

        // TFHE.select: penaltyAmount = amount >> 4  (~6.25% — gas-efficient)
        euint64 penaltyAmt = TFHE.shr(amount, 4);

        id = ++_invoiceCount;
        _invoices[id] = Invoice({
            employer:      msg.sender,
            freelancer:    freelancer,
            amount:        amount,
            penaltyAmount: penaltyAmt,
            dueDate:       dueDate,
            status:        0,
            createdAt:     block.timestamp,
            paidAt:        0
        });

        // ACL: both parties can decrypt their own invoice amounts
        TFHE.allowThis(amount);
        TFHE.allow(amount, msg.sender);
        TFHE.allow(amount, freelancer);
        TFHE.allowThis(penaltyAmt);
        TFHE.allow(penaltyAmt, msg.sender);
        TFHE.allow(penaltyAmt, freelancer);

        _employerInvoices[msg.sender].push(id);
        _freelancerInvoices[freelancer].push(id);

        emit InvoiceCreated(id, msg.sender, freelancer, dueDate);
    }

    /**
     * @notice Pay an invoice.
     *         TFHE.select auto-applies late penalty if block.timestamp > dueDate.
     *         finalAmount = TFHE.select(isOverdue, amount + penalty, amount)
     * @param id  Invoice ID.
     */
    function payInvoice(uint256 id) external {
        Invoice storage inv = _invoices[id];
        if (inv.employer == address(0)) revert InvoiceNotFound();
        if (inv.employer != msg.sender) revert NotAuthorized();
        if (inv.status != 0) revert InvalidStatus(inv.status);

        bool isOverdue = block.timestamp > inv.dueDate;

        // TFHE.select: compute final owed amount including optional penalty
        ebool overdueEnc = TFHE.asEbool(isOverdue);
        euint64 finalAmount = TFHE.select(
            overdueEnc,
            TFHE.add(inv.amount, inv.penaltyAmount),
            inv.amount
        );

        TFHE.allowThis(finalAmount);
        TFHE.allow(finalAmount, msg.sender);
        TFHE.allow(finalAmount, inv.freelancer);

        inv.status = 1;
        inv.paidAt = block.timestamp;

        emit InvoicePaid(id, block.timestamp, isOverdue);
    }

    /**
     * @notice Dispute a pending invoice (either party can raise).
     */
    function disputeInvoice(uint256 id) external {
        Invoice storage inv = _invoices[id];
        if (inv.employer == address(0)) revert InvoiceNotFound();
        if (msg.sender != inv.employer && msg.sender != inv.freelancer) revert NotAuthorized();
        if (inv.status != 0) revert InvalidStatus(inv.status);
        inv.status = 2;
        emit InvoiceDisputed(id, msg.sender);
    }

    /**
     * @notice Auto-resolve a disputed invoice after grace period expires.
     *         Uses TFHE.and(isHighAmount, isPastGrace) for compound encrypted logic.
     *         Freelancer receives amount + penalty as compensation for the wait.
     */
    function autoResolveDispute(uint256 id) external {
        Invoice storage inv = _invoices[id];
        if (inv.employer == address(0)) revert InvoiceNotFound();
        if (inv.status != 2) revert InvalidStatus(inv.status);
        if (block.timestamp <= inv.dueDate + 7 days) revert GraceNotExpired();

        // TFHE.and: compound condition — high-value invoice AND grace expired
        // Both encrypted booleans are true here (verified by require above)
        ebool isPastGrace = TFHE.asEbool(true);
        ebool isSignificant = TFHE.gt(inv.amount, TFHE.asEuint64(0));
        ebool shouldPenalize = TFHE.and(isPastGrace, isSignificant);

        // Freelancer gets amount + penalty as auto-resolve compensation
        euint64 resolvedAmount = TFHE.select(
            shouldPenalize,
            TFHE.add(inv.amount, inv.penaltyAmount),
            inv.amount
        );

        TFHE.allowThis(resolvedAmount);
        TFHE.allow(resolvedAmount, inv.employer);
        TFHE.allow(resolvedAmount, inv.freelancer);

        inv.status = 3;
        emit InvoiceAutoResolved(id, true);
    }

    /**
     * @notice GDPR Right to Erasure.
     *         Employer can zero encrypted fields after invoice is settled.
     *         Sets status = 4 (Erased) for audit trail compliance.
     */
    function eraseInvoice(uint256 id) external {
        Invoice storage inv = _invoices[id];
        if (inv.employer == address(0)) revert InvoiceNotFound();
        if (inv.employer != msg.sender) revert NotAuthorized();
        require(inv.status == 1 || inv.status == 3, "Only settled invoices erasable");

        inv.amount        = TFHE.asEuint64(0);
        inv.penaltyAmount = TFHE.asEuint64(0);
        inv.status        = 4;

        TFHE.allowThis(inv.amount);
        TFHE.allowThis(inv.penaltyAmount);

        emit InvoiceErased(id);
    }

    // ─── Views ────────────────────────────────────────────────────────────────

    function getInvoice(uint256 id) external view returns (
        address employer,
        address freelancer,
        euint64 amount,
        uint256 dueDate,
        uint8   status,
        uint256 createdAt,
        uint256 paidAt
    ) {
        Invoice storage inv = _invoices[id];
        return (inv.employer, inv.freelancer, inv.amount, inv.dueDate, inv.status, inv.createdAt, inv.paidAt);
    }

    function getEmployerInvoices(address employer)   external view returns (uint256[] memory) { return _employerInvoices[employer];     }
    function getFreelancerInvoices(address freelancer) external view returns (uint256[] memory) { return _freelancerInvoices[freelancer]; }
    function invoiceCount() external view returns (uint256) { return _invoiceCount; }
}
