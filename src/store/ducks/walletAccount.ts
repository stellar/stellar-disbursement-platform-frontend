import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

import { getEmbeddedWalletProfile } from "@/api/embeddedWallet";
import { refreshPasskeyToken } from "@/api/passkeyRefresh";
import { SESSION_EXPIRED } from "@/constants/settings";
import { RootState } from "@/store";
import {
  AppError,
  EmbeddedWalletProfileResponse,
  RejectMessage,
  WalletAccountInitialState,
} from "@/types";

export interface JwtWallet {
  contract_address: string;
  sub: string; // credential_id
}

const initialState: WalletAccountInitialState = {
  token: "",
  contractAddress: "",
  credentialId: "",
  isAuthenticated: false,
  isSessionExpired: false,
  isTokenRefresh: false,
  isVerificationPending: false,
  pendingAsset: undefined,
  supportedAssets: undefined,
  receiverContact: undefined,
  status: undefined,
  errorString: undefined,
};

export const refreshWalletTokenAction = createAsyncThunk<
  string,
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
    return response.token;
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

export const fetchWalletProfileAction = createAsyncThunk<
  EmbeddedWalletProfileResponse,
  void,
  { rejectValue: RejectMessage; state: RootState }
>("walletAccount/fetchWalletProfileAction", async (_, { getState, rejectWithValue }) => {
  const { token } = getState().walletAccount;

  if (!token) {
    return rejectWithValue({
      errorString: "Wallet session token is missing",
    });
  }

  try {
    const profile = await getEmbeddedWalletProfile(token);
    return profile;
  } catch (error) {
    const appError = error as AppError;
    const message = appError?.message || "Unable to fetch wallet profile";

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
    setWalletTokenAction: (state, { payload }: PayloadAction<string>) => {
      state.token = payload;
      state.isAuthenticated = true;
      state.isSessionExpired = false;
      state.status = "SUCCESS";
      state.errorString = undefined;
      state.isTokenRefresh = false;
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
      state.supportedAssets = undefined;
      state.receiverContact = undefined;
      state.status = undefined;
      state.errorString = undefined;
    },
    restoreWalletSession: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
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
      state.token = action.payload;
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
    builder.addCase(fetchWalletProfileAction.pending, (state) => {
      state.status = "PENDING";
    });
    builder.addCase(fetchWalletProfileAction.fulfilled, (state, action) => {
      state.status = "SUCCESS";
      state.isVerificationPending = action.payload.verification.is_pending;
      state.pendingAsset = action.payload.verification.pending_asset;
      state.supportedAssets = action.payload.wallet?.supported_assets;
      state.receiverContact = action.payload.wallet?.receiver_contact;
    });
    builder.addCase(fetchWalletProfileAction.rejected, (state, action) => {
      state.status = "ERROR";
      state.errorString = action.payload?.errorString ?? action.error.message;
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
