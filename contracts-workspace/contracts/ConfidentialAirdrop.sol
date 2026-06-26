// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";
import "fhevm/config/ZamaFHEVMConfig.sol";

/// @title ConfidentialAirdrop
/// @notice Confidential token distribution — TokenOps SDK integration.
///         Recipient list is public. Amounts are FHE-encrypted.
///         Designed for Zama Season 3 Special Bounty x TokenOps.
contract ConfidentialAirdrop is SepoliaZamaFHEVMConfig {

    // -------------------------
    // State
    // -------------------------
    address public distributor;
    string  public campaignName;
    bool    public isActive;

    mapping(address => euint64) private encryptedAllocation;
    mapping(address => bool)    public  hasClaimed;
    mapping(address => bool)    public  isRecipient;
    address[]                   public  recipients;

    // -------------------------
    // Events
    // -------------------------
    event CampaignCreated(string name, address distributor);
    event AllocationSet(address indexed recipient);
    event AllocationClaimed(address indexed recipient);
    event CampaignClosed();

    // -------------------------
    // Constructor
    // -------------------------
    constructor(string memory _campaignName) {
        distributor  = msg.sender;
        campaignName = _campaignName;
        isActive     = true;
        emit CampaignCreated(_campaignName, msg.sender);
    }

    modifier onlyDistributor() {
        require(msg.sender == distributor, "Not distributor");
        _;
    }

    modifier campaignActive() {
        require(isActive, "Campaign closed");
        _;
    }

    // -------------------------
    // Distributor: set allocations
    // -------------------------

    /// @notice Set a single recipient's encrypted allocation
    function setAllocation(
        address        recipient,
        einput         encAmount,
        bytes calldata inputProof
    ) external onlyDistributor campaignActive {
        require(recipient != address(0), "Zero address");

        euint64 amount = TFHE.asEuint64(encAmount, inputProof);
        encryptedAllocation[recipient] = amount;

        // Only recipient + distributor can read the amount
        TFHE.allowThis(amount);
        TFHE.allow(amount, recipient);
        TFHE.allow(amount, distributor);

        if (!isRecipient[recipient]) {
            isRecipient[recipient] = true;
            recipients.push(recipient);
        }

        emit AllocationSet(recipient);
    }

    /// @notice Batch-set allocations for multiple recipients
    function batchSetAllocations(
        address[]      calldata recipientList,
        einput[]       calldata encAmounts,
        bytes[]        calldata inputProofs
    ) external onlyDistributor campaignActive {
        require(
            recipientList.length == encAmounts.length &&
            encAmounts.length == inputProofs.length,
            "Length mismatch"
        );

        for (uint256 i = 0; i < recipientList.length; i++) {
            address recipient = recipientList[i];
            euint64 amount    = TFHE.asEuint64(encAmounts[i], inputProofs[i]);

            encryptedAllocation[recipient] = amount;
            TFHE.allowThis(amount);
            TFHE.allow(amount, recipient);
            TFHE.allow(amount, distributor);

            if (!isRecipient[recipient]) {
                isRecipient[recipient] = true;
                recipients.push(recipient);
            }

            emit AllocationSet(recipient);
        }
    }

    // -------------------------
    // Recipient: claim
    // -------------------------

    /// @notice Claim your allocation
    function claimAllocation() external campaignActive {
        require(isRecipient[msg.sender], "Not a recipient");
        require(!hasClaimed[msg.sender], "Already claimed");

        hasClaimed[msg.sender] = true;
        emit AllocationClaimed(msg.sender);

        // In production: transfer cUSDT via ERC-7984
        // tokenContract.transfer(msg.sender, encryptedAllocation[msg.sender]);
    }

    // -------------------------
    // Views
    // -------------------------

    /// @notice Get your encrypted allocation — decrypt client-side
    function getMyAllocation() external view returns (euint64) {
        require(isRecipient[msg.sender], "Not a recipient");
        return encryptedAllocation[msg.sender];
    }

    function getRecipientCount() external view returns (uint256) {
        return recipients.length;
    }

    function getRecipients() external view returns (address[] memory) {
        return recipients;
    }

    function closeCampaign() external onlyDistributor {
        isActive = false;
        emit CampaignClosed();
    }
}
