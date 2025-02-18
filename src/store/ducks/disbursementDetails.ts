import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "store";
import { getDisbursementDetails } from "api/getDisbursementDetails";
import { getDisbursementReceivers } from "api/getDisbursementReceivers";
import { patchDisbursementStatus } from "api/patchDisbursementStatus";
import { endSessionIfTokenInvalid } from "helpers/endSessionIfTokenInvalid";
import { refreshSessionToken } from "helpers/refreshSessionToken";
import { formatDisbursement } from "helpers/formatDisbursements";
import { normalizeApiError } from "helpers/normalizeApiError";
import {
  ApiDisbursementReceiver,
  ApiDisbursementReceivers,
  ApiError,
  Disbursement,
  DisbursementDetailsInitialState,
  DisbursementDraft,
  DisbursementReceiver,
  DisbursementStatusType,
  PaginationParams,
  RejectMessage,
} from "types";

export const getDisbursementDetailsAction = createAsyncThunk<
  Disbursement,
  string,
  { rejectValue: RejectMessage; state: RootState }
>(
  "disbursementDetails/getDisbursementDetailsAction",
  async (disbursementId, { rejectWithValue, getState, dispatch }) => {
    const { token } = getState().userAccount;

    try {
      const disbursementDetails = await getDisbursementDetails(
        token,
        disbursementId,
      );
      refreshSessionToken(dispatch);

      return formatDisbursement(disbursementDetails);
    } catch (error: unknown) {
      const apiError = normalizeApiError(error as ApiError);
      const errorString = apiError.message;
      endSessionIfTokenInvalid(errorString, dispatch);

      return rejectWithValue({
        errorString: `Error fetching disbursement details: ${errorString}`,
      });
    }
  },
);

export const getDisbursementReceiversAction = createAsyncThunk<
  {
    receivers: ApiDisbursementReceivers;
    searchParams?: PaginationParams;
  },
  PaginationParams | undefined,
  { rejectValue: RejectMessage; state: RootState }
>(
  "disbursementDetails/getDisbursementReceiversAction",
  async (params, { rejectWithValue, getState, dispatch }) => {
    const { token } = getState().userAccount;
    const { id, receivers } = getState().disbursementDetails.details;

    const newParams = { ...receivers?.searchParams, ...params };

    try {
      const receivers = await getDisbursementReceivers(token, id, newParams);
      refreshSessionToken(dispatch);

      return {
        receivers: receivers,
        searchParams: newParams,
      };
    } catch (error: unknown) {
      const apiError = normalizeApiError(error as ApiError);
      const errorString = apiError.message;
      endSessionIfTokenInvalid(errorString, dispatch);

      return rejectWithValue({
        errorString: `Error fetching disbursement receivers: ${errorString}`,
      });
    }
  },
);

export const pauseOrStartDisbursementAction = createAsyncThunk<
  { status: DisbursementStatusType; message: string },
  DisbursementStatusType,
  { rejectValue: RejectMessage; state: RootState }
>(
  "disbursementDetails/pauseOrStartDisbursementAction",
  async (newStatus, { rejectWithValue, getState, dispatch }) => {
    const { token } = getState().userAccount;
    const { id } = getState().disbursementDetails.details;

    try {
      const { message } = await patchDisbursementStatus(token, id, newStatus);
      refreshSessionToken(dispatch);

      return { status: newStatus, message };
    } catch (error: unknown) {
      const apiError = normalizeApiError(error as ApiError);
      const errorString = apiError.message;
      endSessionIfTokenInvalid(errorString, dispatch);

      return rejectWithValue({
        errorString: `Error ${
          newStatus === "PAUSED" ? "starting" : "pausing"
        } the disbursement: ${errorString}`,
      });
    }
  },
);

const initialState: DisbursementDetailsInitialState = {
  details: {
    id: "",
    name: "",
    createdAt: "",
    createdBy: "",
    startedBy: "",
    stats: {
      paymentsSuccessfulCount: 0,
      paymentsFailedCount: 0,
      paymentsCanceledCount: 0,
      paymentsRemainingCount: 0,
      paymentsTotalCount: 0,
      totalAmount: "",
      disbursedAmount: "",
      averagePaymentAmount: "",
    },
    asset: {
      code: "",
      id: "",
    },
    registrationContactType: undefined,
    wallet: {
      id: "",
      name: "",
    },
    receivers: {
      items: [],
      pagination: undefined,
      searchParams: undefined,
    },
    status: "DRAFT",
    fileName: undefined,
    statusHistory: [],
    receiverRegistrationMessageTemplate: "",
  },
  instructions: {
    csvName: undefined,
    csvFile: undefined,
  },
  status: undefined,
  errorString: undefined,
};

const disbursementDetailsSlice = createSlice({
  name: "disbursementDetails",
  initialState,
  reducers: {
    setDisbursementDetailsAction: (
      state,
      action: PayloadAction<DisbursementDraft>,
    ) => {
      state.details = action.payload.details;
      state.instructions = action.payload.instructions;
      state.status = "SUCCESS";
      state.errorString = undefined;
    },
    resetDisbursementDetailsAction: () => initialState,
  },
  extraReducers: (builder) => {
    // Get disbursement details
    builder.addCase(
      getDisbursementDetailsAction.pending,
      (state = initialState) => {
        state.status = "PENDING";
      },
    );
    builder.addCase(getDisbursementDetailsAction.fulfilled, (state, action) => {
      state.details = action.payload;
      state.status = "SUCCESS";
      state.errorString = undefined;
    });
    builder.addCase(getDisbursementDetailsAction.rejected, (state, action) => {
      state.status = "ERROR";
      state.errorString = action.payload?.errorString;
    });
    // Get disbursement receivers
    builder.addCase(
      getDisbursementReceiversAction.pending,
      (state = initialState) => {
        state.status = "PENDING";
      },
    );
    builder.addCase(
      getDisbursementReceiversAction.fulfilled,
      (state, action) => {
        state.details.receivers = {
          items: formatDisbursementReceivers(action.payload.receivers.data),
          pagination: action.payload.receivers.pagination,
          searchParams: action.payload.searchParams,
        };
        state.status = "SUCCESS";
        state.errorString = undefined;
      },
    );
    builder.addCase(
      getDisbursementReceiversAction.rejected,
      (state, action) => {
        state.status = "ERROR";
        state.errorString = action.payload?.errorString;
      },
    );
    // Pause or start disbursement
    builder.addCase(
      pauseOrStartDisbursementAction.pending,
      (state = initialState) => {
        state.status = "PENDING";
      },
    );
    builder.addCase(
      pauseOrStartDisbursementAction.fulfilled,
      (state, action) => {
        state.details = {
          ...state.details,
          status: action.payload.status,
        };
        state.status = "SUCCESS";
        state.errorString = undefined;
      },
    );
    builder.addCase(
      pauseOrStartDisbursementAction.rejected,
      (state, action) => {
        state.status = "ERROR";
        state.errorString = action.payload?.errorString;
      },
    );
  },
});

export const disbursementDetailsSelector = (state: RootState) =>
  state.disbursementDetails;
export const { reducer } = disbursementDetailsSlice;
export const { setDisbursementDetailsAction, resetDisbursementDetailsAction } =
  disbursementDetailsSlice.actions;

const formatDisbursementReceivers = (
  items: ApiDisbursementReceiver[],
): DisbursementReceiver[] =>
  items.map((r) => ({
    id: r.id,
    phoneNumber: r.phone_number,
    email: r.email,
    provider: r.receiver_wallet.wallet.name,
    amount: r.payment.amount,
    assetCode: r.payment.asset.code,
    completedAt:
      r.payment.status === "SUCCESS" ? r.payment.updated_at : undefined,
    blockchainId: r.payment.stellar_transaction_id,
    orgId: r.external_id,
    paymentStatus: r.payment.status,
  }));
