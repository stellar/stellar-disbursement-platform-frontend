import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "store";
import { getPayments } from "api/getPayments";
import { handleApiErrorString } from "api/handleApiErrorString";
import { endSessionIfTokenInvalid } from "helpers/endSessionIfTokenInvalid";
import { refreshSessionToken } from "helpers/refreshSessionToken";
import {
  ApiError,
  ApiPayments,
  PaymentsSearchParams,
  ReceiverPaymentsInitialState,
  RejectMessage,
} from "types";

export const getReceiverPaymentsAction = createAsyncThunk<
  ApiPayments,
  string,
  { rejectValue: RejectMessage; state: RootState }
>(
  "receiverPayments/getReceiverPaymentsAction",
  async (receiverId, { rejectWithValue, getState, dispatch }) => {
    const { token } = getState().userAccount;

    try {
      const payments = await getPayments(token, {
        receiver_id: receiverId,
      });
      refreshSessionToken(dispatch);

      return payments;
    } catch (error: unknown) {
      const errorString = handleApiErrorString(error as ApiError);
      endSessionIfTokenInvalid(errorString, dispatch);

      return rejectWithValue({
        errorString: `Error fetching receiver payments: ${errorString}`,
      });
    }
  },
);

export const getReceiverPaymentsWithParamsAction = createAsyncThunk<
  {
    payments: ApiPayments;
    searchParams: PaymentsSearchParams;
  },
  {
    receiver_id: string;
    page?: string;
    page_limit?: string;
  },
  { rejectValue: RejectMessage; state: RootState }
>(
  "receiverPayments/getReceiverPaymentsWithParamsAction",
  async (params, { rejectWithValue, getState, dispatch }) => {
    const { token } = getState().userAccount;
    const { searchParams } = getState().receiverPayments;

    const newParams = { ...searchParams, ...params };

    try {
      const payments = await getPayments(token, newParams);
      refreshSessionToken(dispatch);

      return {
        payments: payments,
        searchParams: newParams,
      };
    } catch (error: unknown) {
      const errorString = handleApiErrorString(error as ApiError);
      endSessionIfTokenInvalid(errorString, dispatch);

      return rejectWithValue({
        errorString: `Error fetching paginated receiver payments: ${errorString}`,
      });
    }
  },
);

const initialState: ReceiverPaymentsInitialState = {
  items: [],
  status: undefined,
  pagination: undefined,
  errorString: undefined,
  searchParams: undefined,
};

const receiverPaymentsSlice = createSlice({
  name: "receiverPayments",
  initialState,
  reducers: {
    resetReceiverPaymentsAction: () => initialState,
  },
  extraReducers: (builder) => {
    // Get payments
    builder.addCase(
      getReceiverPaymentsAction.pending,
      (state = initialState) => {
        state.status = "PENDING";
      },
    );
    builder.addCase(getReceiverPaymentsAction.fulfilled, (state, action) => {
      state.items = action.payload.data;
      state.pagination = action.payload.pagination;
      state.status = "SUCCESS";
      state.errorString = undefined;
      state.searchParams = undefined;
    });
    builder.addCase(getReceiverPaymentsAction.rejected, (state, action) => {
      state.status = "ERROR";
      state.errorString = action.payload?.errorString;
    });
    // Payments with search params
    builder.addCase(
      getReceiverPaymentsWithParamsAction.pending,
      (state = initialState) => {
        state.status = "PENDING";
      },
    );
    builder.addCase(
      getReceiverPaymentsWithParamsAction.fulfilled,
      (state, action) => {
        state.items = action.payload.payments.data;
        state.pagination = action.payload.payments.pagination;
        state.status = "SUCCESS";
        state.errorString = undefined;
        state.searchParams = action.payload.searchParams;
      },
    );
    builder.addCase(
      getReceiverPaymentsWithParamsAction.rejected,
      (state, action) => {
        state.status = "ERROR";
        state.errorString = action.payload?.errorString;
      },
    );
  },
});

export const receiverPaymentsSelector = (state: RootState) =>
  state.receiverPayments;
export const { reducer } = receiverPaymentsSlice;
export const { resetReceiverPaymentsAction } = receiverPaymentsSlice.actions;
