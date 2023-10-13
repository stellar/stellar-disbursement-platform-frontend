import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "store";
import { getReceiverDetails } from "api/getReceiverDetails";
import { retryInvitationSMS } from "api/retryInvitationSMS";
import { handleApiErrorString } from "api/handleApiErrorString";
import { endSessionIfTokenInvalid } from "helpers/endSessionIfTokenInvalid";
import { refreshSessionToken } from "helpers/refreshSessionToken";
import { formatReceiver } from "helpers/formatReceiver";
import {
  ApiError,
  ReceiverDetails,
  ReceiverDetailsInitialState,
  RejectMessage,
} from "types";

export const getReceiverDetailsAction = createAsyncThunk<
  ReceiverDetails,
  string,
  { rejectValue: RejectMessage; state: RootState }
>(
  "receiverDetails/getReceiverDetailsAction",
  async (receiverId, { rejectWithValue, getState, dispatch }) => {
    const { token } = getState().userAccount;

    try {
      const receiverDetails = await getReceiverDetails(token, receiverId);
      refreshSessionToken(dispatch);

      return formatReceiver(receiverDetails);
    } catch (error: unknown) {
      const errorString = handleApiErrorString(error as ApiError);
      endSessionIfTokenInvalid(errorString, dispatch);

      return rejectWithValue({
        errorString: `Error fetching receiver details: ${errorString}`,
      });
    }
  },
);

export const retryInvitationSMSAction = createAsyncThunk<
  string,
  { receiverWalletId: string },
  { rejectValue: RejectMessage; state: RootState }
>(
  "receiverDetails/retryInvitationSMSAction",
  async ({ receiverWalletId }, { rejectWithValue, getState, dispatch }) => {
    const { token } = getState().userAccount;

    try {
      const response = await retryInvitationSMS(token, receiverWalletId);
      return response.message;
    } catch (error: unknown) {
      const err = error as ApiError;
      const errorString = handleApiErrorString(err);
      endSessionIfTokenInvalid(errorString, dispatch);

      return rejectWithValue({
        errorString: `Error retrying invitation: ${errorString}`,
        errorExtras: err?.extras,
      });
    }
  },
);

const initialState: ReceiverDetailsInitialState = {
  id: "",
  phoneNumber: "",
  email: "",
  assetCode: undefined,
  totalReceived: undefined,
  orgId: "",
  stats: {
    paymentsTotalCount: 0,
    paymentsSuccessfulCount: 0,
    paymentsFailedCount: 0,
    paymentsRemainingCount: 0,
  },
  wallets: [
    {
      id: "",
      stellarAddress: "",
      provider: "",
      invitedAt: "",
      createdAt: "",
      smsLastSentAt: "",
      totalPaymentsCount: 0,
      totalAmountReceived: "",
      withdrawnAmount: "",
      assetCode: "",
    },
  ],
  verifications: [
    {
      verificationField: "",
      value: "",
    },
  ],
  status: undefined,
  updateStatus: undefined,
  retryInvitationStatus: undefined,
  errorString: undefined,
};

const receiverDetailsSlice = createSlice({
  name: "receiverDetails",
  initialState,
  reducers: {
    resetReceiverDetailsAction: () => initialState,
    resetRetryStatusAction: (state) => {
      state.retryInvitationStatus = undefined;
    },
  },
  extraReducers: (builder) => {
    // Get receiver details
    builder.addCase(
      getReceiverDetailsAction.pending,
      (state = initialState) => {
        state.status = "PENDING";
      },
    );
    builder.addCase(getReceiverDetailsAction.fulfilled, (state, action) => {
      state.id = action.payload.id;
      state.phoneNumber = action.payload.phoneNumber;
      state.assetCode = action.payload.assetCode;
      state.totalReceived = action.payload.totalReceived;
      state.stats = action.payload.stats;
      state.wallets = action.payload.wallets;
      state.verifications = action.payload.verifications;
      state.email = action.payload.email;
      state.orgId = action.payload.orgId;
      state.status = "SUCCESS";
      state.errorString = undefined;
    });
    builder.addCase(getReceiverDetailsAction.rejected, (state, action) => {
      state.status = "ERROR";
      state.errorString = action.payload?.errorString;
    });
    //retryInvitationSMSAction
    builder.addCase(
      retryInvitationSMSAction.pending,
      (state = initialState) => {
        state.retryInvitationStatus = "PENDING";
      },
    );
    builder.addCase(retryInvitationSMSAction.fulfilled, (state) => {
      state.retryInvitationStatus = "SUCCESS";
      state.errorString = undefined;
    });
    builder.addCase(retryInvitationSMSAction.rejected, (state, action) => {
      state.retryInvitationStatus = "ERROR";
      state.errorString = action.payload?.errorString;
    });
  },
});

export const receiverDetailsSelector = (state: RootState) =>
  state.receiverDetails;
export const { reducer } = receiverDetailsSlice;
export const { resetReceiverDetailsAction, resetRetryStatusAction } =
  receiverDetailsSlice.actions;
