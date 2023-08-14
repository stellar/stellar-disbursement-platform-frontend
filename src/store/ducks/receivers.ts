import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "store";
import { getReceivers } from "api/getReceivers";
import { handleApiErrorString } from "api/handleApiErrorString";
import { formatReceivers } from "helpers/formatReceivers";
import { endSessionIfTokenInvalid } from "helpers/endSessionIfTokenInvalid";
import { refreshSessionToken } from "helpers/refreshSessionToken";
import {
  ApiError,
  ApiReceivers,
  ReceiversInitialState,
  ReceiversSearchParams,
  RejectMessage,
} from "types";

export const getReceiversAction = createAsyncThunk<
  ApiReceivers,
  undefined,
  { rejectValue: RejectMessage; state: RootState }
>(
  "receivers/getReceiversAction",
  async (_, { rejectWithValue, getState, dispatch }) => {
    const { token } = getState().userAccount;

    try {
      const receivers = await getReceivers(token);
      refreshSessionToken(dispatch);

      return receivers;
    } catch (error: unknown) {
      const errorString = handleApiErrorString(error as ApiError);
      endSessionIfTokenInvalid(errorString, dispatch);

      return rejectWithValue({
        errorString: `Error fetching receivers: ${errorString}`,
      });
    }
  },
);

export const getReceiversWithParamsAction = createAsyncThunk<
  {
    receivers: ApiReceivers;
    searchParams: ReceiversSearchParams;
  },
  ReceiversSearchParams,
  { rejectValue: RejectMessage; state: RootState }
>(
  "receivers/getReceiversWithParamsAction",
  async (params, { rejectWithValue, getState, dispatch }) => {
    const { token } = getState().userAccount;
    const { searchParams } = getState().receivers;

    const newParams = { ...searchParams, ...params };

    try {
      const receivers = await getReceivers(token, newParams);
      refreshSessionToken(dispatch);

      return {
        receivers: receivers,
        searchParams: newParams,
      };
    } catch (error: unknown) {
      const errorString = handleApiErrorString(error as ApiError);
      endSessionIfTokenInvalid(errorString, dispatch);

      return rejectWithValue({
        errorString: `Error fetching paginated receivers: ${errorString}`,
      });
    }
  },
);

const initialState: ReceiversInitialState = {
  items: [],
  status: undefined,
  pagination: undefined,
  errorString: undefined,
  searchParams: undefined,
};

const receiversSlice = createSlice({
  name: "receivers",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Get receivers
    builder.addCase(getReceiversAction.pending, (state = initialState) => {
      state.status = "PENDING";
    });
    builder.addCase(getReceiversAction.fulfilled, (state, action) => {
      state.items = formatReceivers(action.payload.data);
      state.pagination = action.payload.pagination;
      state.status = "SUCCESS";
      state.errorString = undefined;
      state.searchParams = undefined;
    });
    builder.addCase(getReceiversAction.rejected, (state, action) => {
      state.status = "ERROR";
      state.errorString = action.payload?.errorString;
    });
    // Receivers with search params
    builder.addCase(
      getReceiversWithParamsAction.pending,
      (state = initialState) => {
        state.status = "PENDING";
      },
    );
    builder.addCase(getReceiversWithParamsAction.fulfilled, (state, action) => {
      state.items = formatReceivers(action.payload.receivers.data);
      state.pagination = action.payload.receivers.pagination;
      state.status = "SUCCESS";
      state.errorString = undefined;
      state.searchParams = action.payload.searchParams;
    });
    builder.addCase(getReceiversWithParamsAction.rejected, (state, action) => {
      state.status = "ERROR";
      state.errorString = action.payload?.errorString;
    });
  },
});

export const receiversSelector = (state: RootState) => state.receivers;
export const { reducer } = receiversSlice;
