import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getPaymentDetails } from "api/getPaymentDetails";
import { getReceiverDetails } from "api/getReceiverDetails";
import { handleApiErrorString } from "api/handleApiErrorString";
import { RootState } from "store";
import { endSessionIfTokenInvalid } from "helpers/endSessionIfTokenInvalid";
import { refreshSessionToken } from "helpers/refreshSessionToken";
import {
  ApiError,
  ApiPayment,
  ApiReceiver,
  PaymentDetailsInfo,
  PaymentDetailsInitialState,
  PaymentDetailsReceiver,
  PaymentDetailsStatusHistoryItem,
  RejectMessage,
} from "types";

export const getPaymentDetailsAction = createAsyncThunk<
  ApiPayment,
  string,
  { rejectValue: RejectMessage; state: RootState }
>(
  "paymentDetails/getPaymentDetailsAction",
  async (paymentId, { rejectWithValue, getState, dispatch }) => {
    const { token } = getState().userAccount;

    try {
      const payment = await getPaymentDetails(token, paymentId);
      refreshSessionToken(dispatch);

      return payment;
    } catch (error: unknown) {
      const errorString = handleApiErrorString(error as ApiError);
      endSessionIfTokenInvalid(errorString, dispatch);

      return rejectWithValue({
        errorString: `Error fetching payment details: ${errorString}`,
      });
    }
  },
);

export const getPaymentDetailsReceiverAction = createAsyncThunk<
  { receiver: ApiReceiver; receiverWalletId: string | undefined },
  string,
  { rejectValue: RejectMessage; state: RootState }
>(
  "paymentDetails/getPaymentDetailsReceiverAction",
  async (receiverId, { rejectWithValue, getState, dispatch }) => {
    const { token } = getState().userAccount;
    const { receiverWalletId } = getState().paymentDetails.details;

    try {
      const receiver = await getReceiverDetails(token, receiverId);
      refreshSessionToken(dispatch);

      return { receiver, receiverWalletId };
    } catch (error: unknown) {
      const errorString = handleApiErrorString(error as ApiError);
      endSessionIfTokenInvalid(errorString, dispatch);

      return rejectWithValue({
        errorString: `Error fetching payment details receiver: ${errorString}`,
      });
    }
  },
);

const initialState: PaymentDetailsInitialState = {
  details: {
    id: "",
    createdAt: "",
    disbursementName: "",
    disbursementId: "",
    receiverId: "",
    receiverWalletId: "",
    transactionId: "",
    senderAddress: "",
    totalAmount: "",
    assetCode: "",
  },
  statusHistory: [],
  receiver: undefined,
  status: undefined,
  errorString: undefined,
};

const paymentDetailsSlice = createSlice({
  name: "paymentDetails",
  initialState,
  reducers: {
    setPaymentDetailsAction: (state, action: PayloadAction<ApiPayment>) => {
      state.details = formatPaymentState(action.payload);
      state.statusHistory = formatStatusHistory(action.payload);
    },
    resetPaymentDetailsAction: () => initialState,
  },
  extraReducers: (builder) => {
    // Payment details
    builder.addCase(getPaymentDetailsAction.pending, (state = initialState) => {
      state.status = "PENDING";
    });
    builder.addCase(getPaymentDetailsAction.fulfilled, (state, action) => {
      state.details = formatPaymentState(action.payload);
      state.statusHistory = formatStatusHistory(action.payload);
      state.status = "SUCCESS";
      state.errorString = undefined;
    });
    builder.addCase(getPaymentDetailsAction.rejected, (state, action) => {
      state.status = "ERROR";
      state.errorString = action.payload?.errorString;
    });
    // Payment receiver
    builder.addCase(
      getPaymentDetailsReceiverAction.pending,
      (state = initialState) => {
        state.status = "PENDING";
      },
    );
    builder.addCase(
      getPaymentDetailsReceiverAction.fulfilled,
      (state, action) => {
        state.receiver = formatPaymentReceiver(action.payload);
        state.status = "SUCCESS";
        state.errorString = undefined;
      },
    );
    builder.addCase(
      getPaymentDetailsReceiverAction.rejected,
      (state, action) => {
        state.status = "ERROR";
        state.errorString = action.payload?.errorString;
      },
    );
  },
});

export const paymentDetailsSelector = (state: RootState) =>
  state.paymentDetails;
export const { reducer } = paymentDetailsSlice;
export const { setPaymentDetailsAction, resetPaymentDetailsAction } =
  paymentDetailsSlice.actions;

// Helpers
const formatStatusHistory = (
  payment: ApiPayment,
): PaymentDetailsStatusHistoryItem[] => {
  return payment.status_history.map((h) => {
    return {
      updatedAt: h.timestamp,
      message: h.status_message,
      status: h.status,
    };
  });
};

const formatPaymentState = (payload: ApiPayment): PaymentDetailsInfo => {
  return {
    id: payload.id,
    createdAt: payload.created_at,
    disbursementName: payload.disbursement.name,
    disbursementId: payload.disbursement.id,
    receiverId: payload?.receiver_wallet?.receiver?.id,
    receiverWalletId: payload?.receiver_wallet?.id,
    transactionId: payload.stellar_transaction_id,
    senderAddress: payload.stellar_address || "",
    totalAmount: payload.amount,
    assetCode: payload.asset.code,
  };
};

const formatPaymentReceiver = (payload: {
  receiver: ApiReceiver;
  receiverWalletId: string | undefined;
}): PaymentDetailsReceiver => {
  const { receiver, receiverWalletId } = payload;
  const paymentWallet = receiverWalletId
    ? receiver.wallets.find((w) => w.id === receiverWalletId)
    : undefined;

  return {
    id: receiver.id,
    phoneNumber: receiver.phone_number,
    walletAddress: paymentWallet?.stellar_address || "",
    provider: paymentWallet?.wallet.name || "",
    totalPaymentsCount: Number(receiver.total_payments),
    successfulPaymentsCount: Number(receiver.successful_payments),
    createdAt: paymentWallet?.created_at || "",
    amountsReceived: receiver.received_amounts.map((a) => ({
      amount: a.received_amount,
      assetCode: a.asset_code,
      assetIssuer: a.asset_issuer,
    })),
    status: paymentWallet?.status,
  };
};
