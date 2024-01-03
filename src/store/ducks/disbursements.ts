import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "store";
import { getDisbursements } from "api/getDisbursements";
import { formatDisbursements } from "helpers/formatDisbursements";
import { endSessionIfTokenInvalid } from "helpers/endSessionIfTokenInvalid";
import { refreshSessionToken } from "helpers/refreshSessionToken";
import { normalizeApiError } from "helpers/normalizeApiError";
import {
  ApiDisbursements,
  ApiError,
  DisbursementsInitialState,
  DisbursementsSearchParams,
  RejectMessage,
} from "types";

export const getDisbursementsAction = createAsyncThunk<
  ApiDisbursements,
  undefined,
  { rejectValue: RejectMessage; state: RootState }
>(
  "disbursements/getDisbursementsAction",
  async (_, { rejectWithValue, getState, dispatch }) => {
    const { token } = getState().userAccount;

    try {
      const disbursements = await getDisbursements(token);
      refreshSessionToken(dispatch);

      return disbursements;
    } catch (error: unknown) {
      const apiError = normalizeApiError(error as ApiError);
      const errorString = apiError.message;
      endSessionIfTokenInvalid(errorString, dispatch);

      return rejectWithValue({
        errorString: `Error fetching disbursements: ${errorString}`,
      });
    }
  },
);

export const getDisbursementsWithParamsAction = createAsyncThunk<
  {
    disbursements: ApiDisbursements;
    searchParams: DisbursementsSearchParams;
  },
  DisbursementsSearchParams,
  { rejectValue: RejectMessage; state: RootState }
>(
  "disbursements/getDisbursementsWithParamsAction",
  async (params, { rejectWithValue, getState, dispatch }) => {
    const { token } = getState().userAccount;
    const { searchParams } = getState().disbursements;

    const newParams = { ...searchParams, ...params };

    try {
      const disbursements = await getDisbursements(token, newParams);
      refreshSessionToken(dispatch);

      return {
        disbursements: disbursements,
        searchParams: newParams,
      };
    } catch (error: unknown) {
      const apiError = normalizeApiError(error as ApiError);
      const errorString = apiError.message;
      endSessionIfTokenInvalid(errorString, dispatch);

      return rejectWithValue({
        errorString: `Error fetching paginated disbursements: ${errorString}`,
      });
    }
  },
);

const initialState: DisbursementsInitialState = {
  items: [],
  status: undefined,
  pagination: undefined,
  errorString: undefined,
  searchParams: undefined,
};

const disbursementsSlice = createSlice({
  name: "disbursements",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Get disbursements
    builder.addCase(getDisbursementsAction.pending, (state = initialState) => {
      state.status = "PENDING";
    });
    builder.addCase(getDisbursementsAction.fulfilled, (state, action) => {
      state.items = formatDisbursements(action.payload.data);
      state.pagination = action.payload.pagination;
      state.status = "SUCCESS";
      state.errorString = undefined;
      state.searchParams = undefined;
    });
    builder.addCase(getDisbursementsAction.rejected, (state, action) => {
      state.status = "ERROR";
      state.errorString = action.payload?.errorString;
    });
    // Disbursements with search params
    builder.addCase(
      getDisbursementsWithParamsAction.pending,
      (state = initialState) => {
        state.status = "PENDING";
      },
    );
    builder.addCase(
      getDisbursementsWithParamsAction.fulfilled,
      (state, action) => {
        state.items = formatDisbursements(action.payload.disbursements.data);
        state.pagination = action.payload.disbursements.pagination;
        state.status = "SUCCESS";
        state.errorString = undefined;
        state.searchParams = action.payload.searchParams;
      },
    );
    builder.addCase(
      getDisbursementsWithParamsAction.rejected,
      (state, action) => {
        state.status = "ERROR";
        state.errorString = action.payload?.errorString;
      },
    );
  },
});

export const disbursementsSelector = (state: RootState) => state.disbursements;
export const { reducer } = disbursementsSlice;
