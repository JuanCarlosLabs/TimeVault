// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract TimeVault {
    struct Lock {
        uint256 amount;
        uint256 unlockTime;
    }

    mapping(address => Lock) public locks;

    event Deposited(address indexed user, uint256 amount, uint256 unlockTime);
    event Withdrawn(address indexed user, uint256 amount);

    function deposit(uint256 _unlockTime) external payable {
        require(msg.value > 0, "No ETH sent");
        require(_unlockTime > block.timestamp, "Unlock time must be in the future");
        require(locks[msg.sender].amount == 0, "Active lock already exists");

        locks[msg.sender] = Lock(msg.value, _unlockTime);
        emit Deposited(msg.sender, msg.value, _unlockTime);
    }

    function withdraw() external {
        Lock memory userLock = locks[msg.sender];
        require(userLock.amount > 0, "No funds to withdraw");
        require(block.timestamp >= userLock.unlockTime, "Funds are still locked");

        delete locks[msg.sender]; // Prevent re-entrancy
        (bool success, ) = msg.sender.call{value: userLock.amount}("");
        require(success, "Transfer failed");

        emit Withdrawn(msg.sender, userLock.amount);
    }
}
