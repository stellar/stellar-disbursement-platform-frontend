import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "store";
import { getWallets } from "api/getWallets";
import { patchWallet } from "api/patchWallet";
import { handleApiErrorString } from "api/handleApiErrorString";
import { endSessionIfTokenInvalid } from "helpers/endSessionIfTokenInvalid";
import { ApiError, ApiWallet, RejectMessage, WalletsInitialState } from "types";

export const getWalletsAction = createAsyncThunk<
  ApiWallet[],
  undefined,
  { rejectValue: RejectMessage; state: RootState }
>(
  "wallets/getWalletsAction",
  async (_, { rejectWithValue, getState, dispatch }) => {
    const { token } = getState().userAccount;

    try {
      const wallets = await getWallets(token);
      return wallets;
    } catch (error: unknown) {
      const errorString = handleApiErrorString(error as ApiError);
      endSessionIfTokenInvalid(errorString, dispatch);

      return rejectWithValue({
        errorString: `Error fetching wallets: ${errorString}`,
      });
    }
  },
);

export const updateWalletAction = createAsyncThunk<
  string,
  { walletId: string; enabled: boolean },
  { rejectValue: RejectMessage; state: RootState }
>(
  "organization/updateWalletAction",
  async ({ walletId, enabled }, { rejectWithValue, getState, dispatch }) => {
    const { token } = getState().userAccount;

    try {
      const wallet = await patchWallet(token, walletId, enabled);
      return wallet.message;
    } catch (error: unknown) {
      const err = error as ApiError;
      const errorString = handleApiErrorString(err);
      endSessionIfTokenInvalid(errorString, dispatch);

      return rejectWithValue({
        errorString: `Error updating wallet: ${errorString}`,
        errorExtras: err?.extras,
      });
    }
  },
);

const initialState: WalletsInitialState = {
  items: [],
  status: undefined,
  errorString: undefined,
};

const walletsSlice = createSlice({
  name: "wallets",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getWalletsAction.pending, (state = initialState) => {
      state.status = "PENDING";
    });
    builder.addCase(getWalletsAction.fulfilled, (state, action) => {
      state.items = action.payload;
      state.status = "SUCCESS";
      state.errorString = undefined;
    });
    builder.addCase(getWalletsAction.rejected, (state, action) => {
      state.status = "ERROR";
      state.errorString = action.payload?.errorString;
    });
  },
});

export const walletsSelector = (state: RootState) => state.wallets;
export const { reducer } = walletsSlice;
