import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "@/store";
import { getDisbursements } from "@/api/getDisbursements";
import { formatDisbursements } from "@/helpers/formatDisbursements";
import { endSessionIfTokenInvalid } from "@/helpers/endSessionIfTokenInvalid";
import { refreshSessionToken } from "@/helpers/refreshSessionToken";
import { normalizeApiError } from "@/helpers/normalizeApiError";
import {
  ApiDisbursements,
  ApiError,
  DisbursementsInitialState,
  DisbursementsSearchParams,
  RejectMessage,
} from "@/types";

// `walletId` is not sent to the API (the request is scoped by the X-Wallet-Id header): it rides
// along on the action so the reducers can tell which distribution account a result belongs to.
export const getDisbursementsAction = createAsyncThunk<
  ApiDisbursements,
  { walletId: string },
  { rejectValue: RejectMessage; state: RootState }
>("disbursements/getDisbursementsAction", async (_, { rejectWithValue, getState, dispatch }) => {
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
});

export const getDisbursementsWithParamsAction = createAsyncThunk<
  {
    disbursements: ApiDisbursements;
    searchParams: DisbursementsSearchParams;
  },
  DisbursementsSearchParams & { walletId: string },
  { rejectValue: RejectMessage; state: RootState }
>(
  "disbursements/getDisbursementsWithParamsAction",
  // `walletId` is stripped here: every remaining key is serialized into the query string and
  // persisted as `state.searchParams` (then replayed by the export), so it must not leak in.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async ({ walletId: _walletId, ...params }, { rejectWithValue, getState, dispatch }) => {
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
  walletId: undefined,
};

const disbursementsSlice = createSlice({
  name: "disbursements",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Get disbursements
    builder.addCase(getDisbursementsAction.pending, (state, action) => {
      state.status = "PENDING";
      state.walletId = action.meta.arg.walletId;
    });
    builder.addCase(getDisbursementsAction.fulfilled, (state, action) => {
      // Drop results for an account the user has already switched away from: without this a
      // slow response for the previous account repaints the table under the new account's bar.
      if (action.meta.arg.walletId !== state.walletId) {
        return;
      }

      state.items = formatDisbursements(action.payload.data);
      state.pagination = action.payload.pagination;
      state.status = "SUCCESS";
      state.errorString = undefined;
      state.searchParams = undefined;
    });
    builder.addCase(getDisbursementsAction.rejected, (state, action) => {
      if (action.meta.arg.walletId !== state.walletId) {
        return;
      }

      state.status = "ERROR";
      state.errorString = action.payload?.errorString;
    });
    // Disbursements with search params
    builder.addCase(getDisbursementsWithParamsAction.pending, (state, action) => {
      state.status = "PENDING";
      state.walletId = action.meta.arg.walletId;
    });
    builder.addCase(getDisbursementsWithParamsAction.fulfilled, (state, action) => {
      if (action.meta.arg.walletId !== state.walletId) {
        return;
      }

      state.items = formatDisbursements(action.payload.disbursements.data);
      state.pagination = action.payload.disbursements.pagination;
      state.status = "SUCCESS";
      state.errorString = undefined;
      state.searchParams = action.payload.searchParams;
    });
    builder.addCase(getDisbursementsWithParamsAction.rejected, (state, action) => {
      if (action.meta.arg.walletId !== state.walletId) {
        return;
      }

      state.status = "ERROR";
      state.errorString = action.payload?.errorString;
    });
  },
});

export const disbursementsSelector = (state: RootState) => state.disbursements;
export const { reducer } = disbursementsSlice;
