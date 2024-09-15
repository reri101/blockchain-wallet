import { ethers } from "ethers";
import { setAddress, setNetwork } from "./redux/walletSlice";
import { Dispatch } from "@reduxjs/toolkit";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const TARGET_NETWORK_ID = "11155111";

export const USDC_CONTRACT_ADDRESS =
  "0x1291070C5f838DCCDddc56312893d3EfE9B372a8";
const provider = new ethers.BrowserProvider(window.ethereum, "sepolia");
const ERC20_ABI = ["function balanceOf(address owner) view returns (uint256)"];

export const connectWalletAndNetwork = async () => {
  if (!window.ethereum) {
    throw new Error("MetaMask not detected. Please install MetaMask.");
  }

  const currentNetwork = await window.ethereum.request({
    method: "net_version",
  });

  if (currentNetwork !== TARGET_NETWORK_ID) {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${parseInt(TARGET_NETWORK_ID).toString(16)}` }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        throw new Error("Please add the Sepolia network to MetaMask manually.");
      } else {
        throw new Error(
          `Unable to switch to the correct network: ${switchError.message}`
        );
      }
    }
  }

  await window.ethereum.request({
    method: "eth_requestAccounts",
    params: [],
  });

  return provider.getSigner();
};

export const getSigner = async () => {
  try {
    return provider.getSigner();
  } catch (error) {
    console.error("Error getting signer:", error);
    throw error;
  }
};

export const getAccountDetails = async () => {
  if (!window.ethereum) {
    throw new Error("MetaMask not detected.");
  }

  const accounts = await window.ethereum.request({ method: "eth_accounts" });
  const provider = new ethers.BrowserProvider(window.ethereum);
  const networkInfo = await provider.getNetwork();

  if (accounts.length > 0) {
    const accountAddress = accounts[0];
    return { address: accountAddress, network: networkInfo.name.toLowerCase() };
  } else {
    throw new Error("No accounts found.");
  }
};

export const fetchBalances = async (address: string) => {
  const ethBalance = await provider.getBalance(address);
  const formattedEthBalance = ethers.formatEther(ethBalance);

  const tokenContract = new ethers.Contract(
    USDC_CONTRACT_ADDRESS,
    ERC20_ABI,
    provider
  );
  const tokenBalance = await tokenContract.balanceOf(address);
  const formattedTokenBalance = ethers.formatUnits(tokenBalance, 6);

  return {
    ethBalance: formattedEthBalance,
    tokenBalance: formattedTokenBalance,
  };
};

export const handleAccountChange = async (
  newAddress: string,
  setAddress: (address: string | null) => void,
  setNetwork: (network: string) => void,
  refreshBalance: () => void
) => {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const networkInfo = await provider.getNetwork();

    const accountsAuthorized = await window.ethereum.request({
      method: "eth_accounts",
    });

    if (!accountsAuthorized.includes(newAddress)) {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const updatedAccounts = await window.ethereum.request({
        method: "eth_accounts",
      });

      if (updatedAccounts.includes(newAddress)) {
        setAddress(newAddress);
        setNetwork(networkInfo.name.toLowerCase());
        refreshBalance();
      } else {
        alert(
          "The new address is not connected. Please reconnect your wallet."
        );
        setAddress(null);
        setNetwork("");
      }
    } else {
      setAddress(newAddress);
      setNetwork(networkInfo.name.toLowerCase());
      refreshBalance();
    }
  } catch (error) {
    console.error("Error handling account change:", error);
  }
};

export const disconnectWallet = async (
  dispatch: Dispatch<any>,
  navigate: (path: string) => void
) => {
  try {
    await window.ethereum.request({
      method: "wallet_revokePermissions",
      params: [{ eth_accounts: {} }],
    });
    dispatch(setAddress(null));
    dispatch(setNetwork(""));
    navigate("/");
  } catch (error) {
    console.error("Error disconnecting wallet:", error);
  }
};

export const getTokenBalance = async (
  contractAddress: string,
  address: string
) => {
  const abi = [
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
  ];

  const contract = new ethers.Contract(contractAddress, abi, provider);
  const decimals = await contract.decimals();
  const balance = await contract.balanceOf(address);

  return ethers.formatUnits(balance, decimals);
};
export const sendTransaction = async (to: string, amount: string) => {
  const signer = await getSigner();
  const tx = await signer.sendTransaction({
    to,
    value: ethers.parseEther(amount),
  });
  await tx.wait();
};

export const sendToken = async (
  contractAddress: string,
  to: string,
  amount: string
) => {
  const signer = await getSigner();

  const abi = [
    "function transfer(address to, uint256 amount) returns (bool)",
    "function decimals() view returns (uint8)",
  ];

  const contract = new ethers.Contract(contractAddress, abi, signer);

  try {
    const decimals = await contract.decimals();

    const tx = await contract.transfer(to, ethers.parseUnits(amount, decimals));

    await tx.wait();
  } catch (error) {
    console.error("Error transferring token:", error);
    throw error;
  }
};

export const getBalance = async (address: string) => {
  const balance = await provider.getBalance(address);
  return ethers.formatEther(balance);
};
