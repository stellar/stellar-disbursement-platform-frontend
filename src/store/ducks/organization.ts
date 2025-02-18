import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "store";
import { getOrgInfo } from "api/getOrgInfo";
import { patchOrgInfo } from "api/patchOrgInfo";
import { getOrgLogo } from "api/getOrgLogo";
import { endSessionIfTokenInvalid } from "helpers/endSessionIfTokenInvalid";
import { refreshSessionToken } from "helpers/refreshSessionToken";
import { normalizeApiError } from "helpers/normalizeApiError";
import {
  ApiError,
  ApiOrgInfo,
  OrgUpdateInfo,
  OrganizationInitialState,
  RejectMessage,
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

const initialState: OrganizationInitialState = {
  data: {
    name: "",
    privacyPolicyLink: "",
    logo: "",
    distributionAccountPublicKey: "",
    timezoneUtcOffset: "",
    isApprovalRequired: undefined,
    receiverInvitationResendInterval: 0,
    paymentCancellationPeriodDays: 0,
    isLinkShortenerEnabled: false,
    isMemoTracingEnabled: false,
    baseUrl: "",
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
        receiverRegistrationMessageTemplate:
          action.payload.receiver_registration_message_template,
        isLinkShortenerEnabled: action.payload.is_link_shortener_enabled,
        isMemoTracingEnabled: action.payload.is_memo_tracing_enabled,
        baseUrl: action.payload.base_url,
        receiverInvitationResendInterval: Number(
          action.payload.receiver_invitation_resend_interval_days || 0,
        ),
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
  },
});

export const organizationSelector = (state: RootState) => state.organization;
export const { reducer } = organizationSlice;
export const { clearUpdateMessageAction, clearErrorAction } =
  organizationSlice.actions;
