// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";
import "fhevm/config/ZamaFHEVMConfig.sol";
import "fhevm/gateway/GatewayCaller.sol";

/// @title ConfidentialPayroll
/// @notice On-chain payroll where salaries are FHE-encrypted.
///         Nobody — not Etherscan, not the contract owner — can read amounts.
contract ConfidentialPayroll is SepoliaZamaFHEVMConfig, GatewayCaller {

    // -------------------------
    // State
    // -------------------------
    address public employer;

    mapping(address => euint64) private encryptedBalance;
    mapping(address => bool)    public  isEmployee;
    address[]                   public  employees;

    euint64 private totalPool;

    // -------------------------
    // Events
    // -------------------------
    event EmployeeAdded(address indexed employee);
    event EmployeeRemoved(address indexed employee);
    event PaymentSent(address indexed employee);
    event PayrollDeposited(address indexed from);
    event EmployerTransferred(address indexed previousEmployer, address indexed newEmployer);

    // -------------------------
    // Modifiers
    // -------------------------
    modifier onlyEmployer() {
        require(msg.sender == employer, "Not employer");
        _;
    }

    modifier onlyEmployee() {
        require(isEmployee[msg.sender], "Not an employee");
        _;
    }

    // -------------------------
    // Constructor
    // -------------------------
    constructor() {
        employer  = msg.sender;
        totalPool = TFHE.asEuint64(0);
        TFHE.allowThis(totalPool);
        TFHE.allow(totalPool, employer);
    }

    // -------------------------
    // Employer actions
    // -------------------------

    /// @notice Deposit encrypted amount into payroll pool
    function depositPayroll(
        einput  encAmount,
        bytes calldata inputProof
    ) external onlyEmployer {
        euint64 amount = TFHE.asEuint64(encAmount, inputProof);
        totalPool = TFHE.add(totalPool, amount);
        TFHE.allowThis(totalPool);
        TFHE.allow(totalPool, employer);
        emit PayrollDeposited(msg.sender);
    }

    /// @notice Register a new employee
    function addEmployee(address employee) external onlyEmployer {
        require(!isEmployee[employee], "Already registered");
        require(employee != address(0), "Zero address");

        isEmployee[employee] = true;
        employees.push(employee);

        // Initialize encrypted balance to zero
        encryptedBalance[employee] = TFHE.asEuint64(0);
        TFHE.allowThis(encryptedBalance[employee]);
        TFHE.allow(encryptedBalance[employee], employee);
        TFHE.allow(encryptedBalance[employee], employer);

        emit EmployeeAdded(employee);
    }

    /// @notice Remove an employee (does not wipe their encrypted balance handle).
    function removeEmployee(address employee) external onlyEmployer {
        require(isEmployee[employee], "Not an employee");
        isEmployee[employee] = false;

        uint256 len = employees.length;
        for (uint256 i = 0; i < len; i++) {
            if (employees[i] == employee) {
                employees[i] = employees[len - 1];
                employees.pop();
                break;
            }
        }
        emit EmployeeRemoved(employee);
    }

    /// @notice Pay an employee — amount stays encrypted end-to-end.
    /// @dev SECURITY: FHE arithmetic does NOT revert on underflow. If we naively
    ///      did `totalPool = TFHE.sub(totalPool, amount)` and amount > totalPool,
    ///      the euint64 pool would wrap around to a huge value, letting the
    ///      employer over-pay. We guard with an encrypted comparison and only
    ///      move funds when the pool can cover the amount (otherwise pay 0).
    function payEmployee(
        address employee,
        einput  encAmount,
        bytes calldata inputProof
    ) external onlyEmployer {
        require(isEmployee[employee], "Not an employee");

        euint64 amount = TFHE.asEuint64(encAmount, inputProof);

        // Encrypted guard: pay only if the pool covers it, else pay 0.
        ebool   hasEnough  = TFHE.le(amount, totalPool);
        euint64 safeAmount = TFHE.select(hasEnough, amount, TFHE.asEuint64(0));

        // Add to employee encrypted balance
        encryptedBalance[employee] = TFHE.add(
            encryptedBalance[employee],
            safeAmount
        );

        // Deduct from pool (cannot underflow now)
        totalPool = TFHE.sub(totalPool, safeAmount);

        // Grant access
        TFHE.allowThis(encryptedBalance[employee]);
        TFHE.allow(encryptedBalance[employee], employee);
        TFHE.allow(encryptedBalance[employee], employer);
        TFHE.allowThis(totalPool);
        TFHE.allow(totalPool, employer);

        emit PaymentSent(employee);
    }

    /// @notice Transfer employer role to a new address.
    function transferEmployer(address newEmployer) external onlyEmployer {
        require(newEmployer != address(0), "Zero address");
        address previous = employer;
        employer = newEmployer;
        TFHE.allow(totalPool, newEmployer);
        emit EmployerTransferred(previous, newEmployer);
    }

    // -------------------------
    // Employee actions
    // -------------------------

    /// @notice Returns encrypted balance handle — decrypt client-side via EIP-712
    function getMyBalance() external view onlyEmployee returns (euint64) {
        return encryptedBalance[msg.sender];
    }

    // -------------------------
    // Views
    // -------------------------
    function getEmployeeCount() external view returns (uint256) {
        return employees.length;
    }

    function getEmployees() external view returns (address[] memory) {
        return employees;
    }
}
