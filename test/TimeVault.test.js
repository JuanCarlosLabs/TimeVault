const { expect } = require("chai");
const { ethers} = require("hardhat");

describe("TimeVault", function () {
  let vault;
  let owner, otherUser;
  const depositAmount = ethers.parseEther("1");

  beforeEach(async () => {
    [owner, otherUser] = await ethers.getSigners();
    const TimeVault = await ethers.getContractFactory("TimeVault");
    vault = await TimeVault.deploy();
  });

  it("should deposit ETH with unlock time", async () => {
    const unlockTime = Math.floor(Date.now() / 1000) + 3600;

    await expect(
      vault.connect(owner).deposit(unlockTime, { value: depositAmount })
    ).to.emit(vault, "Deposited");

    const lock = await vault.locks(owner.address);
    expect(lock.amount).to.equal(depositAmount);
    expect(lock.unlockTime).to.equal(unlockTime);
  });

  it("should not allow deposit with unlock time in the past", async () => {
    const pastTime = Math.floor(Date.now() / 1000) - 100;

    await expect(
      vault.connect(owner).deposit(pastTime, { value: depositAmount })
    ).to.be.revertedWith("Unlock time must be in the future");
  });

  it("should not allow early withdrawal", async () => {
    const futureTime = Math.floor(Date.now() / 1000) + 3600;

    await vault.connect(owner).deposit(futureTime, { value: depositAmount });

    await expect(
      vault.connect(owner).withdraw()
    ).to.be.revertedWith("Funds are still locked");
  });

  it("should allow withdrawal after unlock time", async () => {
    const now = Math.floor(Date.now() / 1000);
    const unlockTime = now + 30;
  
    await vault.connect(owner).deposit(unlockTime, { value: depositAmount });
  
    // Simula el paso del tiempo en Hardhat
    await network.provider.send("evm_increaseTime", [31]);
    await network.provider.send("evm_mine");
  
    await expect(
      vault.connect(owner).withdraw()
    ).to.emit(vault, "Withdrawn");
  
    const lock = await vault.locks(owner.address);
    expect(lock.amount).to.equal(0);
  });
    
  
  it("should not allow multiple deposits from same user", async () => {
    const unlockTime = Math.floor(Date.now() / 1000) + 3600;

    await vault.connect(owner).deposit(unlockTime, { value: depositAmount });

    await expect(
      vault.connect(owner).deposit(unlockTime, { value: depositAmount })
    ).to.be.revertedWith("Active lock already exists");
  });

  it("should prevent withdrawal if no funds are locked", async () => {
    await expect(
      vault.connect(otherUser).withdraw()
    ).to.be.revertedWith("No funds to withdraw");
  });
});
