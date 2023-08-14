import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getStatistics } from "api/getStatistics";
import { handleApiErrorString } from "api/handleApiErrorString";
import { RootState } from "store";
import { endSessionIfTokenInvalid } from "helpers/endSessionIfTokenInvalid";
import { refreshSessionToken } from "helpers/refreshSessionToken";
import {
  ApiError,
  HomeStatistics,
  RejectMessage,
  StatisticsInitialState,
} from "types";

export const getStatisticsAction = createAsyncThunk<
  HomeStatistics,
  undefined,
  { rejectValue: RejectMessage; state: RootState }
>(
  "statistics/getStatisticsAction",
  async (_, { rejectWithValue, getState, dispatch }) => {
    const { token } = getState().userAccount;

    try {
      const statistics = await getStatistics(token);
      refreshSessionToken(dispatch);

      return {
        paymentsSuccessfulCounts: statistics.payment_counters.success,
        paymentsFailedCount: statistics.payment_counters.failed,
        paymentsRemainingCount: Number(
          statistics.payment_counters.total -
            statistics.payment_counters.success -
            statistics.payment_counters.failed,
        ),
        paymentsTotalCount: statistics.payment_counters.total,
        walletsTotalCount: statistics.receiver_wallets_counters.total,
        individualsTotalCount: statistics.total_receivers,
        assets: statistics.payment_amounts_by_asset.map((a) => ({
          assetCode: a.asset_code,
          success: a.payment_amounts.success.toString(),
          average: a.payment_amounts.average.toString(),
        })),
      };
    } catch (error: unknown) {
      const errorString = handleApiErrorString(error as ApiError);
      endSessionIfTokenInvalid(errorString, dispatch);

      return rejectWithValue({
        errorString: `Error fetching statistics: ${errorString}`,
      });
    }
  },
);

const initialState: StatisticsInitialState = {
  stats: undefined,
  status: undefined,
  errorString: undefined,
};

const statisticsSlice = createSlice({
  name: "statistics",
  initialState,
  reducers: {
    clearStatisticsAction: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(getStatisticsAction.pending, (state = initialState) => {
      state.status = "PENDING";
    });
    builder.addCase(getStatisticsAction.fulfilled, (state, action) => {
      state.stats = action.payload;
      state.status = "SUCCESS";
      state.errorString = undefined;
    });
    builder.addCase(getStatisticsAction.rejected, (state, action) => {
      state.status = "ERROR";
      state.errorString = action.payload?.errorString;
    });
  },
});

export const statisticsSelector = (state: RootState) => state.statistics;
export const { reducer } = statisticsSlice;
export const { clearStatisticsAction } = statisticsSlice.actions;
