import React, { useEffect, useState } from "react";
import {
  sendTransaction,
  sendToken,
  getTokenBalance,
  disconnectWallet,
  getAccountDetails,
  getBalance,
  USDC_CONTRACT_ADDRESS,
} from "../ethereum";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import bgImage from "../assets/colourfull_bg.png";
import { ethers } from "ethers";

const Transfer: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [ethAddress, setEthAddress] = useState("");
  const [ethAmount, setEthAmount] = useState("");
  const [erc20Address, setErc20Address] = useState("");
  const [erc20Amount, setErc20Amount] = useState("");
  const [erc20ContractAddress, setErc20ContractAddress] = useState(
    USDC_CONTRACT_ADDRESS
  );

  const [ethBalance, setEthBalance] = useState<string | null>(null);
  const [erc20Balance, setErc20Balance] = useState<string | null>(null);

  const handleEthTransfer = async () => {
    if (!ethers.isAddress(ethAddress)) {
      alert("Invalid ETH address.");
      return;
    }
    if (parseFloat(ethAmount) <= 0) {
      alert("Amount must be greater than zero.");
      return;
    }

    try {
      await sendTransaction(ethAddress, ethAmount);
      alert("ETH Transferred!");
      fetchBalances();
    } catch (error) {
      console.error("Error transferring ETH:", error);
      alert("Error transferring ETH. Please check the console for details.");
    }
  };

  const handleTokenTransfer = async () => {
    if (!ethers.isAddress(erc20Address)) {
      alert("Invalid recipient address.");
      return;
    }
    if (parseFloat(erc20Amount) <= 0) {
      alert("Amount must be greater than zero.");
      return;
    }

    setErc20ContractAddress(USDC_CONTRACT_ADDRESS);

    try {
      const balance = await getTokenBalance(erc20ContractAddress, erc20Address);

      if (parseFloat(balance) < parseFloat(erc20Amount)) {
        alert("You do not have enough tokens to complete this transaction.");
        return;
      }

      await sendToken(erc20ContractAddress, erc20Address, erc20Amount);
      alert("Token Transferred!");
      fetchBalances();
    } catch (error) {
      console.error("Error transferring token:", error);
      alert("Error transferring token. Please check the console for details.");
    }
  };

  const fetchBalances = async () => {
    try {
      const { address } = await getAccountDetails();
      const ethBalance = await getBalance(address);
      const tokenBalance = await getTokenBalance(erc20ContractAddress, address);

      setEthBalance(parseFloat(ethBalance).toFixed(5));
      setErc20Balance(tokenBalance);
    } catch (error) {
      console.error("Error fetching balances:", error);
    }
  };

  const checkWalletConnection = async () => {
    try {
      await getAccountDetails();
      await fetchBalances();
    } catch (error) {
      console.error("Error checking wallet connection:", error);
      navigate("/");
    }
  };

  useEffect(() => {
    checkWalletConnection();
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center h-screen bg-gray-100 p-6 overflow-hidden">
      <div
        className="absolute inset-0 -bottom-[10%]"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundPosition: "bottom right",
          backgroundRepeat: "no-repeat",
          backgroundSize: "500px 500px",
          filter: "blur(100px)",
          zIndex: 0,
        }}
      ></div>
      <div
        className="absolute inset-0 "
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundPosition: "top left",
          backgroundRepeat: "no-repeat",
          backgroundSize: "200px 200px",
          filter: "blur(100px)",
          zIndex: 0,
        }}
      ></div>
      <button
        onClick={() => navigate("/info")}
        className="absolute top-2 left-2 ml-4 bg-gray-500 bg-opacity-80 border-2 border-gray-500 text-white font-bold py-2 px-4 rounded hover:bg-gray-700 transition duration-300"
      >
        Back
      </button>
      <button
        onClick={() => disconnectWallet(dispatch, navigate)}
        className="absolute top-2 right-2 ml-4 bg-red-500 bg-opacity-80 border-2 border-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-700 transition duration-300"
      >
        Disconnect Wallet
      </button>
      <div className="relative z-10">
        <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md mb-10">
          <div className="flex justify-between mb-6">
            <h1 className="text-2xl font-bold">Transfer ETH</h1>
            {ethBalance !== null && (
              <span className="text-sm text-gray-600">
                Available: {ethBalance} ETH
              </span>
            )}
          </div>
          <input
            type="text"
            value={ethAddress}
            onChange={(e) => setEthAddress(e.target.value)}
            className="mb-4 p-2 border border-gray-300 rounded w-full"
            placeholder="Recipient Address"
          />
          <input
            type="text"
            value={ethAmount}
            onChange={(e) => setEthAmount(e.target.value)}
            className="mb-4 p-2 border border-gray-300 rounded w-full"
            placeholder="Amount"
          />
          <button
            onClick={handleEthTransfer}
            className="bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-700 transition duration-300 w-full"
          >
            Transfer ETH
          </button>
        </div>
        <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">
          <div className="flex justify-between mb-6">
            <h1 className="text-2xl font-bold">Transfer USDC</h1>
            {erc20Balance !== null && (
              <span className="text-sm text-gray-600">
                Available: {erc20Balance} USDC
              </span>
            )}
          </div>
          <input
            type="text"
            value={erc20Address}
            onChange={(e) => setErc20Address(e.target.value)}
            className="mb-4 p-2 border border-gray-300 rounded w-full"
            placeholder="Recipient Address"
          />
          <input
            type="text"
            value={erc20Amount}
            onChange={(e) => setErc20Amount(e.target.value)}
            className="mb-4 p-2 border border-gray-300 rounded w-full"
            placeholder="Amount"
          />
          <button
            onClick={handleTokenTransfer}
            className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition duration-300 w-full"
          >
            Transfer Token
          </button>
        </div>
      </div>
    </div>
  );
};

export default Transfer;
