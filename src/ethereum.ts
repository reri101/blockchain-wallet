import { ethers } from "ethers";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const TARGET_NETWORK_ID = "11155111";

const provider = new ethers.BrowserProvider(window.ethereum, "sepolia");

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
