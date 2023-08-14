import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "store";
import { handleApiErrorString } from "api/handleApiErrorString";
import { getOrgInfo } from "api/getOrgInfo";
import { patchOrgInfo } from "api/patchOrgInfo";
import { getOrgLogo } from "api/getOrgLogo";
import { getStellarAccountInfo } from "api/getStellarAccountInfo";
import { endSessionIfTokenInvalid } from "helpers/endSessionIfTokenInvalid";
import { refreshSessionToken } from "helpers/refreshSessionToken";
import {
  ApiError,
  ApiOrgInfo,
  OrgUpdateInfo,
  OrganizationInitialState,
  RejectMessage,
  StellarAccountInfo,
} from "types";

export const getOrgInfoAction = createAsyncThunk<
  ApiOrgInfo,
  undefined,
  { rejectValue: RejectMessage; state: RootState }
>(
  "organization/getOrgInfoAction",
  async (_, { rejectWithValue, getState, dispatch }) => {
    const { token } = getState().userAccount;

    try {
      const orgInfo = await getOrgInfo(token);
      refreshSessionToken(dispatch);

      return orgInfo;
    } catch (error: unknown) {
      const errorString = handleApiErrorString(error as ApiError);
      endSessionIfTokenInvalid(errorString, dispatch);

      return rejectWithValue({
        errorString: `Error fetching organization info: ${errorString}`,
      });
    }
  },
);

export const updateOrgInfoAction = createAsyncThunk<
  string,
  OrgUpdateInfo,
  { rejectValue: RejectMessage; state: RootState }
>(
  "organization/updateOrgInfoAction",
  async ({ name, timezone, logo }, { rejectWithValue, getState, dispatch }) => {
    const { token } = getState().userAccount;

    try {
      const orgInfo = await patchOrgInfo(token, { name, timezone, logo });
      return orgInfo.message;
    } catch (error: unknown) {
      const err = error as ApiError;
      const errorString = handleApiErrorString(err);
      endSessionIfTokenInvalid(errorString, dispatch);

      return rejectWithValue({
        errorString: `Error updating organization info: ${errorString}`,
        errorExtras: err?.extras,
      });
    }
  },
);

export const getOrgLogoAction = createAsyncThunk<
  string,
  undefined,
  { rejectValue: RejectMessage; state: RootState }
>(
  "organization/getOrgLogoAction",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      return await getOrgLogo();
    } catch (error: unknown) {
      const errorString = handleApiErrorString(error as ApiError);
      endSessionIfTokenInvalid(errorString, dispatch);

      return rejectWithValue({
        errorString: `Error fetching organization logo: ${errorString}`,
      });
    }
  },
);

export const getStellarAccountAction = createAsyncThunk<
  StellarAccountInfo,
  string,
  { rejectValue: RejectMessage; state: RootState }
>(
  "organization/getStellarAccount",
  async (stellarAddress, { rejectWithValue }) => {
    try {
      const accountInfo = await getStellarAccountInfo(stellarAddress);
      const balances = accountInfo.balances.map((b) => ({
        balance: b.balance,
        assetCode: b.asset_code ?? "XLM",
        assetIssuer: b.asset_issuer ?? "native",
      }));

      return { address: accountInfo.id, balances };
    } catch (error: unknown) {
      const errorString = handleApiErrorString(error as ApiError);

      return rejectWithValue({
        errorString: `Error fetching Stellar account info: ${errorString}`,
      });
    }
  },
);

const initialState: OrganizationInitialState = {
  data: {
    name: "",
    logo: "",
    distributionAccountPublicKey: "",
    timezoneUtcOffset: "",
    assetBalances: undefined,
  },
  updateMessage: undefined,
  status: undefined,
  errorString: undefined,
  errorExtras: undefined,
};

const organizationSlice = createSlice({
  name: "organization",
  initialState,
  reducers: {
    clearUpdateMessageAction: (state) => {
      state.updateMessage = undefined;
    },
    clearErrorAction: (state) => {
      state.errorString = undefined;
      state.errorExtras = undefined;
    },
  },
  extraReducers: (builder) => {
    // Get org info
    builder.addCase(getOrgInfoAction.pending, (state = initialState) => {
      state.status = "PENDING";
      state.errorString = undefined;
      state.errorExtras = undefined;
    });
    builder.addCase(getOrgInfoAction.fulfilled, (state, action) => {
      state.data = {
        ...state.data,
        name: action.payload.name,
        distributionAccountPublicKey:
          action.payload.distribution_account_public_key,
        timezoneUtcOffset: action.payload.timezone_utc_offset,
      };
      state.status = "SUCCESS";
    });
    builder.addCase(getOrgInfoAction.rejected, (state, action) => {
      state.status = "ERROR";
      state.errorString = action.payload?.errorString;
      state.errorExtras = action.payload?.errorExtras;
    });
    // Update org info
    builder.addCase(updateOrgInfoAction.pending, (state = initialState) => {
      state.updateMessage = undefined;
      state.status = "PENDING";
      state.errorString = undefined;
      state.errorExtras = undefined;
    });
    builder.addCase(updateOrgInfoAction.fulfilled, (state, action) => {
      state.updateMessage = action.payload;
      state.status = "SUCCESS";
    });
    builder.addCase(updateOrgInfoAction.rejected, (state, action) => {
      state.status = "ERROR";
      state.errorString = action.payload?.errorString;
      state.errorExtras = action.payload?.errorExtras;
    });
    // Get org logo
    builder.addCase(getOrgLogoAction.pending, (state = initialState) => {
      state.status = "PENDING";
    });
    builder.addCase(getOrgLogoAction.fulfilled, (state, action) => {
      state.data = {
        ...state.data,
        logo: action.payload,
      };
      state.status = "SUCCESS";
    });
    builder.addCase(getOrgLogoAction.rejected, (state, action) => {
      state.status = "ERROR";
      state.errorString = action.payload?.errorString;
    });
    // Stellar account
    builder.addCase(getStellarAccountAction.pending, (state = initialState) => {
      state.status = "PENDING";
    });
    builder.addCase(getStellarAccountAction.fulfilled, (state, action) => {
      state.data = {
        ...state.data,
        assetBalances: [action.payload],
      };
      state.status = "SUCCESS";
    });
    builder.addCase(getStellarAccountAction.rejected, (state, action) => {
      state.status = "ERROR";
      state.errorString = action.payload?.errorString;
    });
  },
});

export const organizationSelector = (state: RootState) => state.organization;
export const { reducer } = organizationSlice;
export const { clearUpdateMessageAction, clearErrorAction } =
  organizationSlice.actions;
