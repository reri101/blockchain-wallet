import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { setAddress, setNetwork } from "../redux/walletSlice";
import { connectWalletAndNetwork } from "../ethereum";
import bgImage from "../assets/bg.jpg";

const ConnectWallet: React.FC = () => {
  const dispatch = useDispatch();
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = async () => {
    setIsConnecting(true);

    try {
      const signer = await connectWalletAndNetwork();
      const address = await signer.getAddress();

      dispatch(setAddress(address));

      const networkInfo = await signer.provider?.getNetwork();
      dispatch(setNetwork(networkInfo?.name || "unknown"));
    } catch (error: any) {
      if (error.message.includes("rejected")) {
        alert("You rejected the connection request. Please try again.");
      } else {
        alert(`Error: ${error.message}`);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="relative flex justify-center items-center h-screen bg-gradient-to-t from-orange-100 to-black">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{ backgroundImage: `url(${bgImage})` }}
      ></div>
      <div className="relative flex justify-center   w-full h-full">
        <div className="flex-col items-center">
          <div className="h-[40%] flex items-center">
            <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-orange-600">
              Welcome to Blockchain Wallet
            </h1>
          </div>

          <div className="h-[60%] flex justify-center items-start">
            <button
              onClick={connectWallet}
              className="mt-6 border-2 border-gray-500 bg-orange-400 bg-opacity-70  text-white font-bold py-2 px-4 rounded hover:bg-orange-300  transition duration-300"
              disabled={isConnecting}
            >
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectWallet;
