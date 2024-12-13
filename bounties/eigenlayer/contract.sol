// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@eigenlayer/contracts/interfaces/IStrategy.sol";
import "@eigenlayer/contracts/interfaces/IDelegationManager.sol";

/**
 * @title DecentralizedValidatorIntelligence
 * @dev A system for decentralized validator monitoring and rating using EigenLayer
 */
contract DecentralizedValidatorIntelligence is Ownable, ReentrancyGuard {
    // EigenLayer contract interfaces
    IStrategy public immutable restakingStrategy;
    IDelegationManager public immutable delegationManager;

    // Structs
    struct ValidatorMetrics {
        uint256 uptime;
        uint256 performance;
        uint256 lastUpdateBlock;
        address[] monitors;
        mapping(address => bool) isMonitor;
    }

    struct Monitor {
        uint256 stake;
        uint256 reputationScore;
        uint256 lastReportBlock;
    }

    // State variables
    mapping(address => ValidatorMetrics) public validatorMetrics;
    mapping(address => Monitor) public monitors;
    uint256 public minimumStake;
    uint256 public monitorCount;

    // Events
    event ValidatorReported(address indexed validator, address indexed monitor, uint256 performance);
    event MonitorStaked(address indexed monitor, uint256 amount);
    event MonitorUnstaked(address indexed monitor, uint256 amount);

    constructor(
        address _restakingStrategy,
        address _delegationManager,
        uint256 _minimumStake
    ) {
        restakingStrategy = IStrategy(_restakingStrategy);
        delegationManager = IDelegationManager(_delegationManager);
        minimumStake = _minimumStake;
    }

    /**
     * @dev Allows monitors to stake tokens to participate in the network
     * @param amount The amount of tokens to stake
     */
    function stakeAsMonitor(uint256 amount) external nonReentrant {
        require(amount >= minimumStake, "Stake too low");
        require(monitors[msg.sender].stake == 0, "Already staked");

        // Transfer tokens to this contract
        require(
            restakingStrategy.depositIntoStrategy(msg.sender, amount),
            "Stake transfer failed"
        );

        monitors[msg.sender] = Monitor({
            stake: amount,
            reputationScore: 100,
            lastReportBlock: block.number
        });

        monitorCount++;
        emit MonitorStaked(msg.sender, amount);
    }

    /**
     * @dev Submit validator performance report
     * @param validator The validator address being reported
     * @param performanceScore The performance score (0-100)
     */
    function reportValidatorMetrics(
        address validator,
        uint256 performanceScore
    ) external {
        require(monitors[msg.sender].stake > 0, "Not a monitor");
        require(performanceScore <= 100, "Invalid score");

        ValidatorMetrics storage metrics = validatorMetrics[validator];

        if (!metrics.isMonitor[msg.sender]) {
            metrics.monitors.push(msg.sender);
            metrics.isMonitor[msg.sender] = true;
        }

        // Update metrics with weighted average
        uint256 oldWeight = metrics.monitors.length - 1;
        uint256 newPerformance = (metrics.performance * oldWeight + performanceScore) /
            metrics.monitors.length;

        metrics.performance = newPerformance;
        metrics.lastUpdateBlock = block.number;

        emit ValidatorReported(validator, msg.sender, performanceScore);
    }

    /**
     * @dev Get validator performance data
     * @param validator The validator address
     * @return performance The current performance score
     * @return updateBlock The last update block
     * @return monitorCount The number of monitors tracking this validator
     */
    function getValidatorData(address validator)
        external
        view
        returns (
            uint256 performance,
            uint256 updateBlock,
            uint256 monitorCount
        )
    {
        ValidatorMetrics storage metrics = validatorMetrics[validator];
        return (
            metrics.performance,
            metrics.lastUpdateBlock,
            metrics.monitors.length
        );
    }

    // Additional functions to be implemented:
    // - Unstaking mechanism with delay
    // - Slashing for malicious reports
    // - Reward distribution
    // - Governance functions
}
