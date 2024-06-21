import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "store";
import { getOrgInfo } from "api/getOrgInfo";
import { patchOrgInfo } from "api/patchOrgInfo";
import { getOrgLogo } from "api/getOrgLogo";
import { getStellarAccountInfo } from "api/getStellarAccountInfo";
import { endSessionIfTokenInvalid } from "helpers/endSessionIfTokenInvalid";
import { refreshSessionToken } from "helpers/refreshSessionToken";
import { normalizeApiError } from "helpers/normalizeApiError";
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
      const apiError = normalizeApiError(error as ApiError);
      const errorString = apiError.message;
      endSessionIfTokenInvalid(errorString, dispatch);

      return rejectWithValue({
        errorString: `Error fetching organization info: ${errorString}`,
      });
    }
  },
);

export const getOrgCircleInfoAction = createAsyncThunk<
  ApiOrgInfo,
  undefined,
  { rejectValue: RejectMessage; state: RootState }
>(
  "organization/getOrgCircleInfoAction",
  async (_, { rejectWithValue, getState, dispatch }) => {
    const { token } = getState().userAccount;

    try {
      const orgInfo = await getOrgInfo(token);
      refreshSessionToken(dispatch);

      return orgInfo;
    } catch (error: unknown) {
      const apiError = normalizeApiError(error as ApiError);
      const errorString = apiError.message;
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
  async (
    { name, privacyPolicyLink, timezone, logo, isApprovalRequired },
    { rejectWithValue, getState, dispatch },
  ) => {
    const { token } = getState().userAccount;

    try {
      const orgInfo = await patchOrgInfo(token, {
        name,
        privacyPolicyLink,
        timezone,
        logo,
        isApprovalRequired,
      });
      return orgInfo.message;
    } catch (error: unknown) {
      const apiError = normalizeApiError(error as ApiError);
      const errorString = apiError.message;
      endSessionIfTokenInvalid(errorString, dispatch);

      return rejectWithValue({
        errorString: `Error updating organization info: ${errorString}`,
        errorExtras: apiError?.extras,
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
  async (_, { rejectWithValue, getState, dispatch }) => {
    const { token } = getState().userAccount;
    try {
      return await getOrgLogo(token);
    } catch (error: unknown) {
      const apiError = normalizeApiError(error as ApiError);
      const errorString = apiError.message;
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
      const apiError = normalizeApiError(error as ApiError);
      const errorString = apiError.message;

      return rejectWithValue({
        errorString: `Error fetching Stellar account info: ${errorString}`,
      });
    }
  },
);

const initialState: OrganizationInitialState = {
  data: {
    name: "",
    privacyPolicyLink: "",
    logo: "",
    distributionAccountPublicKey: "",
    timezoneUtcOffset: "",
    assetBalances: undefined,
    isApprovalRequired: undefined,
    smsResendInterval: 0,
    paymentCancellationPeriodDays: 0,
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
        privacyPolicyLink: action.payload.privacy_policy_link,
        distributionAccountPublicKey:
          action.payload.distribution_account_public_key,
        timezoneUtcOffset: action.payload.timezone_utc_offset,
        isApprovalRequired: action.payload.is_approval_required,
        smsRegistrationMessageTemplate:
          action.payload.sms_registration_message_template,
        smsResendInterval: Number(action.payload.sms_resend_interval || 0),
        paymentCancellationPeriodDays: Number(
          action.payload.payment_cancellation_period_days || 0,
        ),
        distributionAccount: {
          circleWalletId:
            action.payload.distribution_account?.circle_wallet_id || "",
          status: action.payload.distribution_account?.status || "",
          type: action.payload.distribution_account?.type || "",
        },
      };
      state.status = "SUCCESS";
    });
    builder.addCase(getOrgInfoAction.rejected, (state, action) => {
      state.status = "ERROR";
      state.errorString = action.payload?.errorString;
      state.errorExtras = action.payload?.errorExtras;
    });
    // Get org circle info
    // Not changing status to avoid losing page status
    builder.addCase(getOrgCircleInfoAction.pending, (state = initialState) => {
      state.errorString = undefined;
      state.errorExtras = undefined;
    });
    builder.addCase(getOrgCircleInfoAction.fulfilled, (state, action) => {
      state.data = {
        ...state.data,
        distributionAccount: {
          circleWalletId:
            action.payload.distribution_account?.circle_wallet_id || "",
          status: action.payload.distribution_account?.status || "",
          type: action.payload.distribution_account?.type || "",
        },
      };
    });
    builder.addCase(getOrgCircleInfoAction.rejected, (state, action) => {
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
