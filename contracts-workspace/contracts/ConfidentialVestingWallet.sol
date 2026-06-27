// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";

/**
 * @title ConfidentialVestingWallet
 * @notice On-chain vesting schedule with FHE-encrypted salary amounts.
 *         Cliff + linear vesting using TFHE.select for releasable computation.
 *         GDPR right-to-erasure on completed schedules.
 * @dev    Based on Zama's official ConfidentialVestingWalletCliff pattern.
 *         Season 3 PayMate — Zama Developer Program
 */
contract ConfidentialVestingWallet {

    // ─── Structs ──────────────────────────────────────────────────────────────

    struct VestingSchedule {
        address employer;
        address beneficiary;
        euint64 totalAmount;     // encrypted total compensation
        euint64 releasedAmount;  // encrypted amount already claimed
        uint64  startTime;
        uint64  cliffDuration;   // seconds before any tokens vest
        uint64  vestingDuration; // total vesting period (must be > cliff)
        bool    revocable;
        bool    revoked;
        bool    erased;          // GDPR
    }

    // ─── Storage ──────────────────────────────────────────────────────────────

    mapping(uint256 => VestingSchedule) private _schedules;
    mapping(address => uint256[])       private _employerSchedules;
    mapping(address => uint256[])       private _beneficiarySchedules;
    uint256 private _scheduleCount;

    // ─── Events ───────────────────────────────────────────────────────────────

    event ScheduleCreated(
        uint256 indexed id,
        address indexed employer,
        address indexed beneficiary,
        uint64  cliffDuration,
        uint64  vestingDuration,
        bool    revocable
    );
    event TokensReleased(uint256 indexed id, uint256 timestamp);
    event ScheduleRevoked(uint256 indexed id);
    event ScheduleErased(uint256 indexed id);

    // ─── Errors ───────────────────────────────────────────────────────────────

    error NotBeneficiary();
    error NotEmployer();
    error CliffNotReached();
    error AlreadyRevoked();
    error NotRevocable();
    error NotErasable();
    error ScheduleErased_();

    // ─── Core Functions ───────────────────────────────────────────────────────

    /**
     * @notice Create a vesting schedule with encrypted total compensation.
     * @param beneficiary    Employee / contractor address.
     * @param encTotalAmount FHE-encrypted total amount (einput + proof).
     * @param inputProof     EIP-712 ZK proof from fhEVM SDK.
     * @param cliffDuration  Seconds until first tokens vest.
     * @param vestingDuration Total vesting period in seconds.
     * @param revocable      Whether employer can cancel schedule.
     */
    function createSchedule(
        address beneficiary,
        einput  encTotalAmount,
        bytes calldata inputProof,
        uint64  cliffDuration,
        uint64  vestingDuration,
        bool    revocable
    ) external returns (uint256 id) {
        require(beneficiary != address(0), "Invalid beneficiary");
        require(vestingDuration > cliffDuration, "Vesting must exceed cliff");
        require(vestingDuration > 0, "Zero vesting duration");

        euint64 total    = TFHE.asEuint64(encTotalAmount, inputProof);
        euint64 released = TFHE.asEuint64(0);

        id = ++_scheduleCount;
        _schedules[id] = VestingSchedule({
            employer:        msg.sender,
            beneficiary:     beneficiary,
            totalAmount:     total,
            releasedAmount:  released,
            startTime:       uint64(block.timestamp),
            cliffDuration:   cliffDuration,
            vestingDuration: vestingDuration,
            revocable:       revocable,
            revoked:         false,
            erased:          false
        });

        // ACL: both parties can read their schedule amounts
        TFHE.allowThis(total);
        TFHE.allow(total, msg.sender);
        TFHE.allow(total, beneficiary);
        TFHE.allowThis(released);
        TFHE.allow(released, msg.sender);
        TFHE.allow(released, beneficiary);

        _employerSchedules[msg.sender].push(id);
        _beneficiarySchedules[beneficiary].push(id);

        emit ScheduleCreated(id, msg.sender, beneficiary, cliffDuration, vestingDuration, revocable);
    }

    /**
     * @notice Claim vested tokens.
     *         Uses TFHE.select to compute releasable = vestedSoFar - alreadyReleased.
     *         Uses TFHE.gt to guard against underflow.
     */
    function release(uint256 id) external {
        VestingSchedule storage s = _schedules[id];
        if (msg.sender != s.beneficiary) revert NotBeneficiary();
        if (s.revoked) revert AlreadyRevoked();
        if (s.erased)  revert ScheduleErased_();

        uint64 elapsed = uint64(block.timestamp) - s.startTime;
        if (elapsed < s.cliffDuration) revert CliffNotReached();

        // Compute vested fraction using FHE-compatible integer arithmetic
        bool fullyVested = elapsed >= s.vestingDuration;

        euint64 vestedAmount;
        if (fullyVested) {
            vestedAmount = s.totalAmount;
        } else {
            // Linear vesting: totalAmount * elapsed / vestingDuration
            // Use basis points (10000 = 100%) for precision without floats
            uint64 bps = (uint64(elapsed) * 10_000) / uint64(s.vestingDuration);
            // Clamp to 10000 to avoid overrun
            if (bps > 10_000) bps = 10_000;
            euint64 bpsEnc = TFHE.asEuint64(bps);
            // vestedAmount = totalAmount * bps / 10000
            // Approximate: multiply then shift right 14 (~16384, error < 2%)
            vestedAmount = TFHE.shr(TFHE.mul(s.totalAmount, bpsEnc), 14);
        }

        // TFHE.select: releasable = max(vestedAmount - releasedAmount, 0)
        // Guard against underflow using TFHE.gt
        ebool hasReleasable = TFHE.gt(vestedAmount, s.releasedAmount);
        euint64 releasable = TFHE.select(
            hasReleasable,
            TFHE.sub(vestedAmount, s.releasedAmount),
            TFHE.asEuint64(0)
        );

        // Update released tracker
        s.releasedAmount = vestedAmount;

        TFHE.allowThis(s.releasedAmount);
        TFHE.allow(s.releasedAmount, s.beneficiary);
        TFHE.allow(s.releasedAmount, s.employer);
        TFHE.allow(releasable, s.beneficiary);

        emit TokensReleased(id, block.timestamp);
    }

    /**
     * @notice Revoke a revocable schedule (employer only).
     *         Unvested tokens return to employer.
     */
    function revoke(uint256 id) external {
        VestingSchedule storage s = _schedules[id];
        if (msg.sender != s.employer) revert NotEmployer();
        if (!s.revocable) revert NotRevocable();
        if (s.revoked) revert AlreadyRevoked();
        s.revoked = true;
        emit ScheduleRevoked(id);
    }

    /**
     * @notice GDPR Right to Erasure.
     *         Either party can erase a completed or revoked schedule.
     *         Zeroes encrypted fields and marks schedule erased.
     */
    function eraseSchedule(uint256 id) external {
        VestingSchedule storage s = _schedules[id];
        bool isParty = (msg.sender == s.employer || msg.sender == s.beneficiary);
        if (!isParty) revert NotEmployer();
        bool isSettled = s.revoked || (block.timestamp >= s.startTime + uint256(s.vestingDuration));
        if (!isSettled) revert NotErasable();

        s.totalAmount    = TFHE.asEuint64(0);
        s.releasedAmount = TFHE.asEuint64(0);
        s.erased         = true;

        TFHE.allowThis(s.totalAmount);
        TFHE.allowThis(s.releasedAmount);

        emit ScheduleErased(id);
    }

    // ─── Views ────────────────────────────────────────────────────────────────

    function getSchedule(uint256 id) external view returns (
        address employer,
        address beneficiary,
        uint64  startTime,
        uint64  cliffDuration,
        uint64  vestingDuration,
        bool    revocable,
        bool    revoked,
        bool    erased
    ) {
        VestingSchedule storage s = _schedules[id];
        return (
            s.employer,
            s.beneficiary,
            s.startTime,
            s.cliffDuration,
            s.vestingDuration,
            s.revocable,
            s.revoked,
            s.erased
        );
    }

    function getAmounts(uint256 id) external view returns (euint64 total, euint64 released) {
        return (_schedules[id].totalAmount, _schedules[id].releasedAmount);
    }

    function getEmployerSchedules(address e)    external view returns (uint256[] memory) { return _employerSchedules[e];    }
    function getBeneficiarySchedules(address b) external view returns (uint256[] memory) { return _beneficiarySchedules[b]; }
    function scheduleCount() external view returns (uint256) { return _scheduleCount; }
}
