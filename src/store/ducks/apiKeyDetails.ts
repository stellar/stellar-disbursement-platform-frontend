import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { endSessionIfTokenInvalid } from "helpers/endSessionIfTokenInvalid";
import { refreshSessionToken } from "helpers/refreshSessionToken";
import { normalizeApiError } from "helpers/normalizeApiError";
import { getApiKey } from "api/getApiKey";

import {
  ApiKey,
  ApiKeyDetailsInitialState,
  ApiError,
  RejectMessage,
} from "types";

import { RootState } from "store";

export const apiKeyDetailsInitialState: ApiKeyDetailsInitialState = {
  details: null,
  status: undefined,
  errorString: undefined,
};

export const getApiKeyDetailsAction = createAsyncThunk<
  ApiKey,
  string,
  { rejectValue: RejectMessage; state: RootState }
>(
  "apiKeyDetails/getApiKeyDetailsAction",
  async (apiKeyId, { rejectWithValue, getState, dispatch }) => {
    const { token } = getState().userAccount;

    try {
      const response = await getApiKey(token, apiKeyId);
      refreshSessionToken(dispatch);

      return response;
    } catch (error: unknown) {
      const apiError = normalizeApiError(error as ApiError);
      const errorString = apiError.message;
      endSessionIfTokenInvalid(errorString, dispatch);

      return rejectWithValue({
        errorString: `Error fetching API key details: ${errorString}`,
      });
    }
  },
);

const apiKeyDetailsSlice = createSlice({
  name: "apiKeyDetails",
  initialState: apiKeyDetailsInitialState,
  reducers: {
    resetApiKeyDetailsAction: () => apiKeyDetailsInitialState,
    clearApiKeyDetailsErrorAction: (state) => {
      state.errorString = undefined;
      state.status = "SUCCESS";
    },
    setApiKeyDetailsAction: (state, action) => {
      state.details = action.payload;
      state.status = "SUCCESS";
      state.errorString = undefined;
    },
    updateApiKeyDetailsAction: (state, action) => {
      if (state.details) {
        state.details = {
          ...state.details,
          ...action.payload,
        };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(
        getApiKeyDetailsAction.pending,
        (state = apiKeyDetailsInitialState) => {
          state.status = "PENDING";
          state.errorString = undefined;
        },
      )
      .addCase(getApiKeyDetailsAction.fulfilled, (state, action) => {
        state.status = "SUCCESS";
        state.details = action.payload;
        state.errorString = undefined;
      })
      .addCase(getApiKeyDetailsAction.rejected, (state, action) => {
        state.status = "ERROR";
        state.errorString = action.payload?.errorString;
      });
  },
});

export const apiKeyDetailsSelector = (state: RootState) => state.apiKeyDetails;

export const {
  resetApiKeyDetailsAction,
  clearApiKeyDetailsErrorAction,
  updateApiKeyDetailsAction,
} = apiKeyDetailsSlice.actions;
export const { reducer } = apiKeyDetailsSlice;
