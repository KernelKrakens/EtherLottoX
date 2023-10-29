import Web3 from "web3";

let web3;

if (window.ethereum) {
  web3 = new Web3(window.ethereum);
  // Request account access if needed
  window.ethereum.request({ method: "eth_requestAccounts" }).catch((error) => {
    console.error("User denied account access");
  });
} else if (window.web3) {
  web3 = new Web3(window.web3.currentProvider);
} else {
  // Use a fallback provider here, like Infura or Alchemy
  const provider = new Web3.providers.HttpProvider("http://127.0.0.1:8545");
  web3 = new Web3(provider);
}

export default web3;
