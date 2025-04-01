import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.esm.min.js";

const contractAddress = "TU_DIRECCION_DEL_CONTRATO";
const abi = [/* COPIA EL ABI DE REMIX AQUÍ */];

let signer;
let contract;

document.getElementById("connectButton").onclick = async () => {
  if (window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    contract = new ethers.Contract(contractAddress, abi, signer);
    document.getElementById("status").innerText = "Wallet connected ✅";
  }
};

document.getElementById("depositButton").onclick = async () => {
  const ethAmount = document.getElementById("ethAmount").value;
  const unlockTime = document.getElementById("unlockTime").value;

  const tx = await contract.deposit(unlockTime, {
    value: ethers.utils.parseEther(ethAmount),
  });
  await tx.wait();
  document.getElementById("status").innerText = "Deposit successful!";
};

document.getElementById("withdrawButton").onclick = async () => {
  const tx = await contract.withdraw();
  await tx.wait();
  document.getElementById("status").innerText = "Withdrawal complete!";
};
