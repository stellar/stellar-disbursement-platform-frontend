import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "store";
import { getPayments } from "api/getPayments";
import { handleApiErrorString } from "api/handleApiErrorString";
import { endSessionIfTokenInvalid } from "helpers/endSessionIfTokenInvalid";
import { refreshSessionToken } from "helpers/refreshSessionToken";
import {
  ApiError,
  ApiPayments,
  PaymentsInitialState,
  PaymentsSearchParams,
  RejectMessage,
} from "types";

export const getPaymentsAction = createAsyncThunk<
  ApiPayments,
  undefined,
  { rejectValue: RejectMessage; state: RootState }
>(
  "payments/getPaymentsAction",
  async (_, { rejectWithValue, getState, dispatch }) => {
    const { token } = getState().userAccount;

    try {
      const payments = await getPayments(token);
      refreshSessionToken(dispatch);

      return payments;
    } catch (error: unknown) {
      const errorString = handleApiErrorString(error as ApiError);
      endSessionIfTokenInvalid(errorString, dispatch);

      return rejectWithValue({
        errorString: `Error fetching payments: ${errorString}`,
      });
    }
  },
);

export const getPaymentsWithParamsAction = createAsyncThunk<
  {
    payments: ApiPayments;
    searchParams: PaymentsSearchParams;
  },
  PaymentsSearchParams,
  { rejectValue: RejectMessage; state: RootState }
>(
  "payments/getPaymentsWithParamsAction",
  async (params, { rejectWithValue, getState, dispatch }) => {
    const { token } = getState().userAccount;
    const { searchParams } = getState().payments;

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
        errorString: `Error fetching paginated payments: ${errorString}`,
      });
    }
  },
);

const initialState: PaymentsInitialState = {
  items: [],
  status: undefined,
  pagination: undefined,
  errorString: undefined,
  searchParams: undefined,
};

const paymentsSlice = createSlice({
  name: "payments",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Get payments
    builder.addCase(getPaymentsAction.pending, (state = initialState) => {
      state.status = "PENDING";
    });
    builder.addCase(getPaymentsAction.fulfilled, (state, action) => {
      state.items = action.payload.data;
      state.pagination = action.payload.pagination;
      state.status = "SUCCESS";
      state.errorString = undefined;
      state.searchParams = undefined;
    });
    builder.addCase(getPaymentsAction.rejected, (state, action) => {
      state.status = "ERROR";
      state.errorString = action.payload?.errorString;
    });
    // Payments with search params
    builder.addCase(
      getPaymentsWithParamsAction.pending,
      (state = initialState) => {
        state.status = "PENDING";
      },
    );
    builder.addCase(getPaymentsWithParamsAction.fulfilled, (state, action) => {
      state.items = action.payload.payments.data;
      state.pagination = action.payload.payments.pagination;
      state.status = "SUCCESS";
      state.errorString = undefined;
      state.searchParams = action.payload.searchParams;
    });
    builder.addCase(getPaymentsWithParamsAction.rejected, (state, action) => {
      state.status = "ERROR";
      state.errorString = action.payload?.errorString;
    });
  },
});

export const paymentsSelector = (state: RootState) => state.payments;
export const { reducer } = paymentsSlice;
