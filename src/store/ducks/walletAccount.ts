import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

import { refreshPasskeyToken } from "@/api/passkeyRefresh";
import { SESSION_EXPIRED } from "@/constants/settings";
import { RootState } from "@/store";
import { ApiAsset, AppError, RejectMessage, WalletAccountInitialState } from "@/types";

export interface JwtWallet {
  contract_address: string;
  sub: string; // credential_id
}

type WalletSessionPayload = {
  token: string;
  isVerificationPending?: boolean;
  pendingAsset?: ApiAsset;
};

const initialState: WalletAccountInitialState = {
  token: "",
  contractAddress: "",
  credentialId: "",
  isAuthenticated: false,
  isSessionExpired: false,
  isTokenRefresh: false,
  isVerificationPending: false,
  pendingAsset: undefined,
  status: undefined,
  errorString: undefined,
};

export const refreshWalletTokenAction = createAsyncThunk<
  WalletSessionPayload,
  void,
  { rejectValue: RejectMessage; state: RootState }
>("walletAccount/refreshWalletTokenAction", async (_, { getState, rejectWithValue }) => {
  const { token } = getState().walletAccount;

  if (!token) {
    return rejectWithValue({
      errorString: "Wallet session token is missing",
    });
  }

  try {
    const response = await refreshPasskeyToken(token);
    return {
      token: response.token,
      isVerificationPending: response.is_verification_pending,
      pendingAsset: response.pending_asset,
    };
  } catch (error: unknown) {
    if (error === SESSION_EXPIRED) {
      return rejectWithValue({
        errorString: SESSION_EXPIRED,
      });
    }

    const appError = error as AppError;
    const message = appError?.message || "Unable to refresh wallet session";

    return rejectWithValue({
      errorString: message,
      errorExtras: appError?.extras,
    });
  }
});

const walletAccountSlice = createSlice({
  name: "walletAccount",
  initialState,
  reducers: {
    setWalletInfoAction: (state, { payload }: PayloadAction<JwtWallet>) => {
      state.contractAddress = payload.contract_address;
      state.credentialId = payload.sub;
      state.isAuthenticated = true;
      state.isSessionExpired = false;
      state.status = "SUCCESS";
      state.errorString = undefined;
      state.isTokenRefresh = false;
    },
    setWalletTokenAction: (state, { payload }: PayloadAction<WalletSessionPayload>) => {
      state.token = payload.token;
      state.isAuthenticated = true;
      state.isSessionExpired = false;
      state.status = "SUCCESS";
      state.errorString = undefined;
      state.isTokenRefresh = false;
      state.isVerificationPending = payload.isVerificationPending ?? false;
      state.pendingAsset = payload.pendingAsset;
    },
    clearWalletInfoAction: (state) => {
      state.token = "";
      state.contractAddress = "";
      state.credentialId = "";
      state.isAuthenticated = false;
      state.isSessionExpired = false;
      state.isTokenRefresh = false;
      state.isVerificationPending = false;
      state.pendingAsset = undefined;
      state.status = undefined;
      state.errorString = undefined;
    },
    restoreWalletSession: (state, action: PayloadAction<WalletSessionPayload>) => {
      state.token = action.payload.token;
      state.isVerificationPending = action.payload.isVerificationPending ?? false;
      state.pendingAsset = action.payload.pendingAsset;
      state.isSessionExpired = false;
      state.status = "SUCCESS";
      state.errorString = undefined;
      state.isTokenRefresh = false;
      state.isAuthenticated = true;
    },
    walletSessionExpiredAction: (state) => {
      state.isSessionExpired = true;
      state.status = "ERROR";
    },
  },
  extraReducers: (builder) => {
    builder.addCase(refreshWalletTokenAction.pending, (state) => {
      state.status = "PENDING";
      state.isTokenRefresh = false;
      state.errorString = undefined;
    });
    builder.addCase(refreshWalletTokenAction.fulfilled, (state, action) => {
      state.token = action.payload.token;
      state.isVerificationPending = action.payload.isVerificationPending ?? false;
      state.pendingAsset = action.payload.pendingAsset;
      state.isTokenRefresh = true;
      state.status = "SUCCESS";
      state.errorString = undefined;
    });
    builder.addCase(refreshWalletTokenAction.rejected, (state, action) => {
      state.status = "ERROR";
      state.isTokenRefresh = false;
      state.errorString = action.payload?.errorString;
      if (action.payload?.errorString === SESSION_EXPIRED) {
        state.isSessionExpired = true;
      }
    });
  },
});

export const walletAccountSelector = (state: RootState) => state.walletAccount;

export const { reducer } = walletAccountSlice;
export const {
  setWalletInfoAction,
  setWalletTokenAction,
  clearWalletInfoAction,
  restoreWalletSession,
  walletSessionExpiredAction,
} = walletAccountSlice.actions;
