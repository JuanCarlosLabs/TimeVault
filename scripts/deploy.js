const hre = require("hardhat");

async function main() {
  const TimeVault = await hre.ethers.getContractFactory("TimeVault");
  const vault = await TimeVault.deploy();
  await vault.waitForDeployment();

  console.log(`✅ TimeVault deployed to: ${vault.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
