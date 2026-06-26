// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title ReputationRegistry
/// @notice ERC-8004-style on-chain reputation for PayMate freelancers.
///         A credential is minted when an invoice is settled. Reputation
///         scores are intentionally PUBLIC (reputation must be verifiable by
///         anyone), while payment AMOUNTS stay FHE-encrypted in
///         ConfidentialInvoice. This separation is deliberate: privacy applies
///         to figures, not to the existence of completed work.
contract ReputationRegistry {

    // -------------------------
    // Types
    // -------------------------
    struct Credential {
        address subject;    // freelancer the credential is about
        address issuer;     // client / contract that confirmed the work
        uint256 invoiceId;  // reference into ConfidentialInvoice
        string  category;   // e.g. "Smart Contract Audit"
        uint64  issuedAt;
        bool    revoked;
    }

    // -------------------------
    // State
    // -------------------------
    address public owner;            // admin (deployer)
    address public invoiceContract;  // optional authorized minter

    uint256 public credentialCount;
    mapping(uint256 => Credential)  public  credentials;
    mapping(address => uint256[])   private subjectCredentials;

    mapping(address => uint256) public completedJobs;
    mapping(address => uint256) public disputes;

    // -------------------------
    // Events
    // -------------------------
    event CredentialIssued(uint256 indexed id, address indexed subject, address indexed issuer);
    event CredentialRevoked(uint256 indexed id);
    event DisputeRecorded(address indexed subject);
    event InvoiceContractSet(address indexed invoiceContract);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    // -------------------------
    // Modifiers
    // -------------------------
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyAuthorized() {
        require(msg.sender == owner || msg.sender == invoiceContract, "Not authorized");
        _;
    }

    constructor() {
        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    // -------------------------
    // Admin
    // -------------------------
    function setInvoiceContract(address _invoiceContract) external onlyOwner {
        require(_invoiceContract != address(0), "Zero address");
        invoiceContract = _invoiceContract;
        emit InvoiceContractSet(_invoiceContract);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Zero address");
        address previous = owner;
        owner = newOwner;
        emit OwnershipTransferred(previous, newOwner);
    }

    // -------------------------
    // Credential lifecycle
    // -------------------------

    /// @notice Mint a reputation credential for a completed job.
    function issueCredential(
        address        subject,
        address        issuer,
        uint256        invoiceId,
        string calldata category
    ) external onlyAuthorized returns (uint256) {
        require(subject != address(0),          "Zero subject");
        require(bytes(category).length > 0,     "Empty category");

        uint256 id = credentialCount++;
        credentials[id] = Credential({
            subject:   subject,
            issuer:    issuer,
            invoiceId: invoiceId,
            category:  category,
            issuedAt:  uint64(block.timestamp),
            revoked:   false
        });
        subjectCredentials[subject].push(id);
        completedJobs[subject] += 1;

        emit CredentialIssued(id, subject, issuer);
        return id;
    }

    /// @notice Revoke a credential (e.g. after a successful dispute).
    function revokeCredential(uint256 id) external onlyAuthorized {
        require(id < credentialCount, "Bad id");
        Credential storage c = credentials[id];
        require(!c.revoked, "Already revoked");
        c.revoked = true;
        if (completedJobs[c.subject] > 0) {
            completedJobs[c.subject] -= 1;
        }
        emit CredentialRevoked(id);
    }

    /// @notice Record a dispute against a subject, lowering their score.
    function recordDispute(address subject) external onlyAuthorized {
        disputes[subject] += 1;
        emit DisputeRecorded(subject);
    }

    // -------------------------
    // Views
    // -------------------------

    /// @notice Public reputation score in [0, 1000].
    ///         score = 1000 * jobs / (jobs + 2 * disputes); 0 when no jobs.
    ///         Disputes are weighted 2x to penalise unreliability.
    function reputationScore(address subject) external view returns (uint256) {
        uint256 jobs = completedJobs[subject];
        if (jobs == 0) return 0;
        uint256 weightedTotal = jobs + (2 * disputes[subject]);
        return (jobs * 1000) / weightedTotal;
    }

    function getCredentials(address subject) external view returns (uint256[] memory) {
        return subjectCredentials[subject];
    }

    function getCredential(uint256 id) external view returns (Credential memory) {
        require(id < credentialCount, "Bad id");
        return credentials[id];
    }
}
