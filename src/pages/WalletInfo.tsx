import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../redux/store";
import {
  fetchBalances,
  getAccountDetails,
  handleAccountChange,
} from "../ethereum";
import {
  setAddress,
  setNetwork,
  setEthBalance,
  setTokenBalance,
} from "../redux/walletSlice";
import { useNavigate } from "react-router-dom";

import metamaskIcon from "../assets/metamask_icon.png";
import ethIcon from "../assets/eth_icon.png";
import usdcIcon from "../assets/usdc_icon.png";
import bgImage from "../assets/colourfull_bg.png";

const WalletInfo: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { address, network, ethBalance, tokenBalance } = useSelector(
    (state: RootState) => state.wallet
  );

  const formatBalance = (balance: string) => parseFloat(balance).toFixed(4);

  const refreshBalance = async () => {
    try {
      if (address && network === "sepolia") {
        const { ethBalance, tokenBalance } = await fetchBalances(address);
        dispatch(setEthBalance(ethBalance));
        dispatch(setTokenBalance(tokenBalance));
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  const checkWalletConnection = async () => {
    try {
      const { address, network } = await getAccountDetails();
      dispatch(setAddress(address));
      dispatch(setNetwork(network));
      refreshBalance();
    } catch (error) {
      console.error("Error checking wallet connection:", error);
      navigate("/");
    }
  };

  const disconnectWallet = async () => {
    await window.ethereum.request({
      method: "wallet_revokePermissions",
      params: [{ eth_accounts: {} }],
    });
    dispatch(setAddress(null));
    dispatch(setNetwork(""));
    navigate("/");
  };

  const handleAccountsChanged = async (accounts: string[]) => {
    if (accounts.length > 0) {
      const newAddress = accounts[0];
      console.log("New address detected:", newAddress);
      await handleAccountChange(
        newAddress,
        (address) => dispatch(setAddress(address)),
        (network) => dispatch(setNetwork(network)),
        refreshBalance
      );
    } else {
      dispatch(setAddress(null));
      dispatch(setNetwork(""));
      navigate("/");
    }
  };

  useEffect(() => {
    checkWalletConnection();
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      return () => {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
      };
    }
  }, []);

  useEffect(() => {
    if (address && network === "sepolia") {
      refreshBalance();
    }
  }, [address, network]);

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
        onClick={disconnectWallet}
        className="absolute top-2 right-2 ml-4 bg-red-500 bg-opacity-80 border-2 border-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-700 transition duration-300"
      >
        Disconnect Wallet
      </button>
      {/* Główna zawartość */}
      <div className="relative z-10 bg-white shadow-lg rounded-lg p-6 w-full max-w-lg">
        <h1 className="text-2xl font-bold text-center mb-4">
          Wallet Information
        </h1>

        {address ? (
          <>
            <div className="mb-2 flex-col items-center">
              <span className="font-semibold">Address: </span>
              <div className="mb-2 flex items-center">
                <img
                  src={metamaskIcon}
                  alt="MetaMask"
                  className="w-6 h-6 mr-2"
                />
                <span className="break-all ml-2">{address}</span>
              </div>
            </div>
            <div className="mb-2 flex-col items-center">
              <span className="font-semibold">Network: </span>
              <div className="mb-2 flex items-center">
                <span className="w-3 h-3 bg-green-500 rounded-full ml-2"></span>
                <span className="ml-2">{network}</span>
              </div>
            </div>
            <div className="mb-2 flex-col items-center">
              <span className="font-semibold">ETH Balance: </span>
              <div className="mb-2 flex items-center">
                <img src={ethIcon} alt="Ethereum" className="w-6 h-6 mr-2" />
                <span className="ml-2">
                  {ethBalance
                    ? `${formatBalance(ethBalance)} ETH`
                    : "Loading..."}
                </span>
              </div>
            </div>
            <div className="mb-2 flex-col items-center">
              <span className="font-semibold">USDC Balance: </span>
              <div className="mb-2 flex items-center">
                <img src={usdcIcon} alt="USDC" className="w-6 h-6 mr-2" />
                <span className="ml-2">
                  {tokenBalance ? tokenBalance : "0"} USDC
                </span>
              </div>
            </div>
            <div className="w-full flex justify-center">
              <button
                className="mt-4 bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-700 transition duration-300"
                onClick={() => navigate("/transfer")}
              >
                Transfer tokens
              </button>
            </div>
          </>
        ) : (
          <div className="text-red-500 font-bold text-center">
            No wallet connected. Please connect your wallet.
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletInfo;
