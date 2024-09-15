import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface WalletState {
  address: string | null;
  network: string;
  ethBalance: string;
  tokenBalance: string;
}

const initialState: WalletState = {
  address: null,
  network: "sepolia",
  ethBalance: "0",
  tokenBalance: "0",
};

const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    setAddress(state, action: PayloadAction<string | null>) {
      state.address = action.payload;
    },
    setNetwork(state, action: PayloadAction<string>) {
      state.network = action.payload;
    },
    setEthBalance(state, action: PayloadAction<string>) {
      state.ethBalance = action.payload;
    },
    setTokenBalance(state, action: PayloadAction<string>) {
      state.tokenBalance = action.payload;
    },
  },
});

export const { setAddress, setNetwork, setEthBalance, setTokenBalance } =
  walletSlice.actions;
export default walletSlice.reducer;
