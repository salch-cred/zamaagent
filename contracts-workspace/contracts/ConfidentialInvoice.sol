// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";
import "fhevm/config/ZamaFHEVMConfig.sol";

/// @title ConfidentialInvoice
/// @notice Freelancer invoicing where payment amounts are FHE-encrypted.
///         Only the freelancer and client can see the invoice amount.
contract ConfidentialInvoice is SepoliaZamaFHEVMConfig {

    // -------------------------
    // Structs
    // -------------------------
    struct Invoice {
        address  freelancer;
        address  client;
        euint64  amount;          // FHE encrypted
        bool     isPaid;
        bool     isDisputed;
        uint256  createdAt;
        uint256  dueDate;
        string   workDescription; // public description only
    }

    // -------------------------
    // State
    // -------------------------
    uint256 public invoiceCount;
    mapping(uint256 => Invoice)   public invoices;
    mapping(address => uint256[]) public freelancerInvoices;
    mapping(address => uint256[]) public clientInvoices;

    // -------------------------
    // Events
    // -------------------------
    event InvoiceCreated(uint256 indexed id, address indexed freelancer, address indexed client);
    event InvoicePaid(uint256 indexed id, address indexed client);
    event InvoiceDisputed(uint256 indexed id);

    // -------------------------
    // Freelancer: create invoice
    // -------------------------
    function createInvoice(
        address        client,
        einput         encAmount,
        bytes calldata inputProof,
        string calldata description,
        uint256        dueDate
    ) external returns (uint256) {
        require(client != address(0),      "Zero address");
        require(client != msg.sender,      "Client is self");
        require(dueDate > block.timestamp, "Due date in past");
        require(bytes(description).length > 0, "Empty description");

        uint256 id = invoiceCount++;
        euint64 amount = TFHE.asEuint64(encAmount, inputProof);

        invoices[id] = Invoice({
            freelancer:      msg.sender,
            client:          client,
            amount:          amount,
            isPaid:          false,
            isDisputed:      false,
            createdAt:       block.timestamp,
            dueDate:         dueDate,
            workDescription: description
        });

        // Only freelancer + client can read the encrypted amount
        TFHE.allowThis(amount);
        TFHE.allow(amount, msg.sender);
        TFHE.allow(amount, client);

        freelancerInvoices[msg.sender].push(id);
        clientInvoices[client].push(id);

        emit InvoiceCreated(id, msg.sender, client);
        return id;
    }

    // -------------------------
    // Client: pay invoice
    // -------------------------
    function payInvoice(uint256 invoiceId) external {
        Invoice storage inv = invoices[invoiceId];
        require(msg.sender == inv.client, "Not the client");
        require(!inv.isPaid,     "Already paid");
        require(!inv.isDisputed, "Invoice disputed");

        inv.isPaid = true;
        emit InvoicePaid(invoiceId, msg.sender);
    }

    // -------------------------
    // Dispute
    // -------------------------
    function disputeInvoice(uint256 invoiceId) external {
        Invoice storage inv = invoices[invoiceId];
        require(
            msg.sender == inv.freelancer || msg.sender == inv.client,
            "Not party to invoice"
        );
        require(!inv.isPaid, "Already paid");
        inv.isDisputed = true;
        emit InvoiceDisputed(invoiceId);
    }

    // -------------------------
    // Views
    // -------------------------

    /// @notice Encrypted amount handle — only freelancer or client can decrypt
    function getInvoiceAmount(uint256 invoiceId) external view returns (euint64) {
        Invoice storage inv = invoices[invoiceId];
        require(
            msg.sender == inv.freelancer || msg.sender == inv.client,
            "Not authorized"
        );
        return inv.amount;
    }

    function getFreelancerInvoices(address freelancer)
        external view returns (uint256[] memory)
    {
        return freelancerInvoices[freelancer];
    }

    function getClientInvoices(address client)
        external view returns (uint256[] memory)
    {
        return clientInvoices[client];
    }

    function getInvoiceStatus(uint256 invoiceId)
        external view
        returns (bool isPaid, bool isDisputed, uint256 dueDate)
    {
        Invoice storage inv = invoices[invoiceId];
        return (inv.isPaid, inv.isDisputed, inv.dueDate);
    }
}
