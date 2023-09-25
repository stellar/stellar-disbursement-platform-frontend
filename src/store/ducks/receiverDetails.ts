import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "store";
import { getReceiverDetails } from "api/getReceiverDetails";
import { patchReceiverInfo } from "api/patchReceiver";
import { handleApiErrorString } from "api/handleApiErrorString";
import { endSessionIfTokenInvalid } from "helpers/endSessionIfTokenInvalid";
import { refreshSessionToken } from "helpers/refreshSessionToken";
import {
  ApiError,
  ApiReceiver,
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

export const updateReceiverDetailsAction = createAsyncThunk<
  string,
  { receiverId: string; email: string; externalId: string },
  { rejectValue: RejectMessage; state: RootState }
>(
  "receiverDetails/updateReceiverDetailsAction",
  async (
    { receiverId, email, externalId },
    { rejectWithValue, getState, dispatch },
  ) => {
    const { token } = getState().userAccount;

    try {
      const profileInfo = await patchReceiverInfo(token, receiverId, {
        email,
        externalId,
      });
      return profileInfo.message;
    } catch (error: unknown) {
      const err = error as ApiError;
      const errorString = handleApiErrorString(err);
      endSessionIfTokenInvalid(errorString, dispatch);

      return rejectWithValue({
        errorString: `Error updating profile info: ${errorString}`,
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
  errorString: undefined,
};

const receiverDetailsSlice = createSlice({
  name: "receiverDetails",
  initialState,
  reducers: {
    resetReceiverDetailsAction: () => initialState,
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
    //updateReceiverDetailsAction
    builder.addCase(
      updateReceiverDetailsAction.pending,
      (state = initialState) => {
        state.updateStatus = "PENDING";
      },
    );
    builder.addCase(updateReceiverDetailsAction.fulfilled, (state) => {
      state.updateStatus = "SUCCESS";
      state.errorString = undefined;
    });
    builder.addCase(updateReceiverDetailsAction.rejected, (state, action) => {
      state.updateStatus = "ERROR";
      state.errorString = action.payload?.errorString;
    });
  },
});

export const receiverDetailsSelector = (state: RootState) =>
  state.receiverDetails;
export const { reducer } = receiverDetailsSlice;
export const { resetReceiverDetailsAction } = receiverDetailsSlice.actions;

const formatReceiver = (receiver: ApiReceiver): ReceiverDetails => ({
  id: receiver.id,
  phoneNumber: receiver.phone_number,
  email: receiver.email,
  orgId: receiver.external_id,
  // TODO: how to handle multiple
  assetCode: receiver.received_amounts?.[0].asset_code,
  totalReceived: receiver.received_amounts?.[0].received_amount,
  stats: {
    paymentsTotalCount: Number(receiver.total_payments),
    paymentsSuccessfulCount: Number(receiver.successful_payments),
    paymentsFailedCount: Number(receiver.failed_payments),
    paymentsRemainingCount: Number(receiver.remaining_payments),
  },
  wallets: receiver.wallets.map((w) => ({
    id: w.id,
    stellarAddress: w.stellar_address,
    provider: w.wallet.name,
    invitedAt: w.invited_at,
    createdAt: w.created_at,
    smsLastSentAt: w.last_sms_sent,
    totalPaymentsCount: Number(w.payments_received),
    // TODO: how to handle multiple
    assetCode: w.received_amounts[0].asset_code,
    totalAmountReceived: w.received_amounts[0].received_amount,
    // TODO: withdrawn amount
    withdrawnAmount: "",
  })),
  verifications: receiver.verifications.map((v) => ({
    verificationField: v.VerificationField,
    value: v.HashedValue,
  })),
});
