// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";
import "fhevm/config/ZamaFHEVMConfig.sol";
import "fhevm/gateway/GatewayCaller.sol";

/**
 * @title ConfidentialPayroll
 * @notice On-chain payroll with FHE-encrypted salaries.
 *         Includes: batch payments, encrypted salary negotiation,
 *         FHE underflow guard (TFHE.select), and employee self-withdrawal.
 * @dev    Season 3 PayMate — Zama Developer Program
 */
contract ConfidentialPayroll is SepoliaZamaFHEVMConfig, GatewayCaller {

    // ─── Salary negotiation struct ─────────────────────────────────────────────────────

    struct SalaryProposal {
        address  employee;
        euint64  proposedSalary; // FHE-encrypted proposed monthly salary
        bool     accepted;
        bool     declined;
        uint256  createdAt;
    }

    // ─── State ───────────────────────────────────────────────────────────────────

    address public employer;

    mapping(address => euint64)   private encryptedBalance;
    mapping(address => euint64)   private encryptedSalary;   // base salary on record
    mapping(address => bool)      public  isEmployee;
    address[]                     public  employees;
    euint64                       private totalPool;

    mapping(uint256 => SalaryProposal) private _proposals;
    uint256 private _proposalCount;

    // ─── Events ─────────────────────────────────────────────────────────────────

    event EmployeeAdded(address indexed employee);
    event EmployeeRemoved(address indexed employee);
    event PaymentSent(address indexed employee);
    event BatchPaymentSent(uint256 employeeCount);
    event PayrollDeposited(address indexed from);
    event EmployerTransferred(address indexed previousEmployer, address indexed newEmployer);
    event SalaryProposed(uint256 indexed proposalId, address indexed employee);
    event SalaryAccepted(uint256 indexed proposalId, address indexed employee);
    event SalaryDeclined(uint256 indexed proposalId, address indexed employee);
    event WithdrawalRequested(address indexed employee);

    // ─── Modifiers ─────────────────────────────────────────────────────────────

    modifier onlyEmployer() {
        require(msg.sender == employer, "Not employer");
        _;
    }

    modifier onlyEmployee() {
        require(isEmployee[msg.sender], "Not an employee");
        _;
    }

    // ─── Constructor ──────────────────────────────────────────────────────────────

    constructor() {
        employer  = msg.sender;
        totalPool = TFHE.asEuint64(0);
        TFHE.allowThis(totalPool);
        TFHE.allow(totalPool, employer);
    }

    // ─── Employer actions ─────────────────────────────────────────────────────────

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

        isEmployee[employee]       = true;
        encryptedBalance[employee] = TFHE.asEuint64(0);
        encryptedSalary[employee]  = TFHE.asEuint64(0);
        employees.push(employee);

        TFHE.allowThis(encryptedBalance[employee]);
        TFHE.allow(encryptedBalance[employee], employee);
        TFHE.allow(encryptedBalance[employee], employer);
        TFHE.allowThis(encryptedSalary[employee]);
        TFHE.allow(encryptedSalary[employee], employee);
        TFHE.allow(encryptedSalary[employee], employer);

        emit EmployeeAdded(employee);
    }

    /// @notice Remove an employee
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

    /**
     * @notice Pay a single employee with encrypted amount.
     * @dev    TFHE.select guards against pool underflow:
     *         safeAmount = TFHE.select(pool >= amount, amount, 0)
     */
    function payEmployee(
        address employee,
        einput  encAmount,
        bytes calldata inputProof
    ) external onlyEmployer {
        require(isEmployee[employee], "Not an employee");

        euint64 amount     = TFHE.asEuint64(encAmount, inputProof);
        ebool   hasEnough  = TFHE.le(amount, totalPool);
        euint64 safeAmount = TFHE.select(hasEnough, amount, TFHE.asEuint64(0));

        encryptedBalance[employee] = TFHE.add(encryptedBalance[employee], safeAmount);
        totalPool                  = TFHE.sub(totalPool, safeAmount);

        TFHE.allowThis(encryptedBalance[employee]);
        TFHE.allow(encryptedBalance[employee], employee);
        TFHE.allow(encryptedBalance[employee], employer);
        TFHE.allowThis(totalPool);
        TFHE.allow(totalPool, employer);

        emit PaymentSent(employee);
    }

    /**
     * @notice Pay multiple employees in a SINGLE transaction.
     *         Loops over list and uses TFHE.select underflow guard for each.
     *         Dramatic gas savings vs multiple single-pay calls.
     * @param empList    Array of employee addresses.
     * @param encAmounts FHE-encrypted amounts (einput handles).
     * @param proofs     EIP-712 proofs, one per employee.
     */
    function batchPayEmployees(
        address[] calldata empList,
        einput[]  calldata encAmounts,
        bytes[]   calldata proofs
    ) external onlyEmployer {
        uint256 len = empList.length;
        require(len == encAmounts.length && len == proofs.length, "Length mismatch");
        require(len > 0 && len <= 50, "Batch size 1-50");

        for (uint256 i = 0; i < len; i++) {
            address emp = empList[i];
            if (!isEmployee[emp]) continue; // skip non-employees silently

            euint64 amount     = TFHE.asEuint64(encAmounts[i], proofs[i]);
            ebool   hasEnough  = TFHE.le(amount, totalPool);
            euint64 safeAmount = TFHE.select(hasEnough, amount, TFHE.asEuint64(0));

            encryptedBalance[emp] = TFHE.add(encryptedBalance[emp], safeAmount);
            totalPool             = TFHE.sub(totalPool, safeAmount);

            TFHE.allowThis(encryptedBalance[emp]);
            TFHE.allow(encryptedBalance[emp], emp);
            TFHE.allow(encryptedBalance[emp], employer);
        }

        TFHE.allowThis(totalPool);
        TFHE.allow(totalPool, employer);

        emit BatchPaymentSent(len);
    }

    /**
     * @notice Propose an encrypted salary for an employee.
     *         Salary stays encrypted — only employer + employee can decrypt.
     *         Neither party sees the other’s internal valuation.
     * @param employee   Target employee address.
     * @param encSalary  FHE-encrypted monthly salary amount.
     * @param inputProof EIP-712 ZK proof.
     */
    function proposeSalary(
        address  employee,
        einput   encSalary,
        bytes calldata inputProof
    ) external onlyEmployer returns (uint256 proposalId) {
        require(isEmployee[employee], "Not an employee");

        euint64 salary = TFHE.asEuint64(encSalary, inputProof);

        proposalId = ++_proposalCount;
        _proposals[proposalId] = SalaryProposal({
            employee:       employee,
            proposedSalary: salary,
            accepted:       false,
            declined:       false,
            createdAt:      block.timestamp
        });

        TFHE.allowThis(salary);
        TFHE.allow(salary, employer);
        TFHE.allow(salary, employee);

        emit SalaryProposed(proposalId, employee);
    }

    /**
     * @notice Employee accepts a salary proposal.
     *         TFHE.select: accepted salary becomes the new on-record base salary.
     * @param proposalId Proposal to accept.
     */
    function acceptSalaryProposal(uint256 proposalId) external onlyEmployee {
        SalaryProposal storage p = _proposals[proposalId];
        require(p.employee == msg.sender, "Not your proposal");
        require(!p.accepted && !p.declined, "Already resolved");

        p.accepted = true;

        // TFHE.select: update salary only if the proposal is valid (accepted = true)
        ebool  isAccepted  = TFHE.asEbool(true); // tautological — accepted path
        euint64 newSalary  = TFHE.select(isAccepted, p.proposedSalary, encryptedSalary[msg.sender]);
        encryptedSalary[msg.sender] = newSalary;

        TFHE.allowThis(encryptedSalary[msg.sender]);
        TFHE.allow(encryptedSalary[msg.sender], msg.sender);
        TFHE.allow(encryptedSalary[msg.sender], employer);

        emit SalaryAccepted(proposalId, msg.sender);
    }

    /// @notice Employee declines a salary proposal.
    function declineSalaryProposal(uint256 proposalId) external onlyEmployee {
        SalaryProposal storage p = _proposals[proposalId];
        require(p.employee == msg.sender, "Not your proposal");
        require(!p.accepted && !p.declined, "Already resolved");
        p.declined = true;
        emit SalaryDeclined(proposalId, msg.sender);
    }

    /// @notice Employer cancels a pending proposal.
    function cancelSalaryProposal(uint256 proposalId) external onlyEmployer {
        SalaryProposal storage p = _proposals[proposalId];
        require(!p.accepted && !p.declined, "Already resolved");
        p.declined = true;
    }

    /**
     * @notice Employee requests withdrawal of encrypted amount from their balance.
     *         Emits event for off-chain x402 rail to process payout.
     *         Uses TFHE.select to deduct only available balance (no underflow).
     */
    function requestWithdrawal(
        einput  encAmount,
        bytes calldata inputProof
    ) external onlyEmployee {
        euint64 amount     = TFHE.asEuint64(encAmount, inputProof);
        euint64 balance    = encryptedBalance[msg.sender];

        // TFHE.select: deduct only if balance covers withdrawal
        ebool   hasFunds   = TFHE.ge(balance, amount);
        euint64 safeWithdraw = TFHE.select(hasFunds, amount, TFHE.asEuint64(0));

        encryptedBalance[msg.sender] = TFHE.sub(balance, safeWithdraw);

        TFHE.allowThis(encryptedBalance[msg.sender]);
        TFHE.allow(encryptedBalance[msg.sender], msg.sender);
        TFHE.allow(encryptedBalance[msg.sender], employer);
        TFHE.allow(safeWithdraw, msg.sender);
        TFHE.allowThis(safeWithdraw);

        // Off-chain x402 rail reads WithdrawalRequested event and routes tokens
        emit WithdrawalRequested(msg.sender);
    }

    /// @notice Transfer employer role
    function transferEmployer(address newEmployer) external onlyEmployer {
        require(newEmployer != address(0), "Zero address");
        address previous = employer;
        employer = newEmployer;
        TFHE.allow(totalPool, newEmployer);
        emit EmployerTransferred(previous, newEmployer);
    }

    // ─── Employee views ──────────────────────────────────────────────────────────

    function getMyBalance() external view onlyEmployee returns (euint64) {
        return encryptedBalance[msg.sender];
    }

    function getMyEncryptedSalary() external view onlyEmployee returns (euint64) {
        return encryptedSalary[msg.sender];
    }

    // ─── Public views ───────────────────────────────────────────────────────────

    function getEmployeeCount() external view returns (uint256) { return employees.length; }
    function getEmployees()     external view returns (address[] memory) { return employees; }

    function getProposal(uint256 proposalId) external view returns (
        address employee,
        bool    accepted,
        bool    declined,
        uint256 createdAt
    ) {
        SalaryProposal storage p = _proposals[proposalId];
        return (p.employee, p.accepted, p.declined, p.createdAt);
    }
}
