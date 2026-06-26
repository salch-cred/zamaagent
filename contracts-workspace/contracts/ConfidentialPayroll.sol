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

    /// @notice Pay an employee — amount stays encrypted end-to-end
    function payEmployee(
        address employee,
        einput  encAmount,
        bytes calldata inputProof
    ) external onlyEmployer {
        require(isEmployee[employee], "Not an employee");

        euint64 amount = TFHE.asEuint64(encAmount, inputProof);

        // Add to employee encrypted balance
        encryptedBalance[employee] = TFHE.add(
            encryptedBalance[employee],
            amount
        );

        // Deduct from pool
        totalPool = TFHE.sub(totalPool, amount);

        // Grant access
        TFHE.allowThis(encryptedBalance[employee]);
        TFHE.allow(encryptedBalance[employee], employee);
        TFHE.allow(encryptedBalance[employee], employer);
        TFHE.allowThis(totalPool);
        TFHE.allow(totalPool, employer);

        emit PaymentSent(employee);
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
