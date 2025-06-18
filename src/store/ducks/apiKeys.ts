import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "store";
import { endSessionIfTokenInvalid } from "helpers/endSessionIfTokenInvalid";
import { refreshSessionToken } from "helpers/refreshSessionToken";
import { normalizeApiError } from "helpers/normalizeApiError";
import {
  ApiKey,
  ApiKeysInitialState,
  ApiError,
  RejectMessage,
  CreateApiKeyRequest,
} from "types";
import { getApiKeys } from "api/getApiKeys";
import { postApiKey } from "api/postApiKey";
import { deleteApiKey } from "api/deleteApiKey";

export const apiKeysInitialState: ApiKeysInitialState = {
  items: [],
  status: undefined,
  errorString: undefined,
};

export const getApiKeysAction = createAsyncThunk<
  ApiKey[],
  undefined,
  { rejectValue: RejectMessage; state: RootState }
>(
  "apiKeys/getApiKeysAction",
  async (_, { rejectWithValue, getState, dispatch }) => {
    const { token } = getState().userAccount;

    try {
      const response = await getApiKeys(token);
      refreshSessionToken(dispatch);

      return Array.isArray(response) ? response : response.data || [];
    } catch (error: unknown) {
      const apiError = normalizeApiError(error as ApiError);
      const errorString = apiError.message;
      endSessionIfTokenInvalid(errorString, dispatch);

      return rejectWithValue({
        errorString: `Error fetching API keys: ${errorString}`,
      });
    }
  },
);

export const createApiKeyAction = createAsyncThunk<
  ApiKey,
  CreateApiKeyRequest,
  { rejectValue: RejectMessage; state: RootState }
>(
  "apiKeys/createApiKeyAction",
  async (apiKeyData, { rejectWithValue, getState, dispatch }) => {
    const { token } = getState().userAccount;

    try {
      const response = await postApiKey(token, apiKeyData);
      refreshSessionToken(dispatch);

      return response;
    } catch (error: unknown) {
      const apiError = normalizeApiError(error as ApiError);
      const errorString = apiError.message;
      endSessionIfTokenInvalid(errorString, dispatch);

      return rejectWithValue({
        errorString: `Error creating API key: ${errorString}`,
      });
    }
  },
);

export const deleteApiKeyAction = createAsyncThunk<
  string,
  string,
  { rejectValue: RejectMessage; state: RootState }
>(
  "apiKeys/deleteApiKeyAction",
  async (apiKeyId, { rejectWithValue, getState, dispatch }) => {
    const { token } = getState().userAccount;

    try {
      await deleteApiKey(token, apiKeyId);
      refreshSessionToken(dispatch);

      return apiKeyId;
    } catch (error: unknown) {
      const apiError = normalizeApiError(error as ApiError);
      const errorString = apiError.message;
      endSessionIfTokenInvalid(errorString, dispatch);

      return rejectWithValue({
        errorString: `Error deleting API key: ${errorString}`,
      });
    }
  },
);

const apiKeysSlice = createSlice({
  name: "apiKeys",
  initialState: apiKeysInitialState,
  reducers: {
    resetApiKeysAction: () => apiKeysInitialState,
    clearApiKeysErrorAction: (state) => {
      state.errorString = undefined;
      state.status = "SUCCESS";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getApiKeysAction.pending, (state = apiKeysInitialState) => {
        state.status = "PENDING";
        state.errorString = undefined;
      })
      .addCase(getApiKeysAction.fulfilled, (state, action) => {
        state.status = "SUCCESS";
        state.items = action.payload;
        state.errorString = undefined;
      })
      .addCase(getApiKeysAction.rejected, (state, action) => {
        state.status = "ERROR";
        state.errorString = action.payload?.errorString;
      })
      // Create API Key
      .addCase(createApiKeyAction.pending, (state) => {
        state.status = "PENDING";
        state.errorString = undefined;
      })
      .addCase(createApiKeyAction.fulfilled, (state, action) => {
        state.status = "SUCCESS";
        state.items.unshift(action.payload); // Add new key to the beginning
        state.errorString = undefined;
      })
      .addCase(createApiKeyAction.rejected, (state, action) => {
        state.status = "ERROR";
        state.errorString = action.payload?.errorString;
      })
      // Delete API Key
      .addCase(deleteApiKeyAction.pending, (state) => {
        state.status = "PENDING";
        state.errorString = undefined;
      })
      .addCase(deleteApiKeyAction.fulfilled, (state, action) => {
        state.status = "SUCCESS";
        state.items = state.items.filter((item) => item.id !== action.payload);
        state.errorString = undefined;
      })
      .addCase(deleteApiKeyAction.rejected, (state, action) => {
        state.status = "ERROR";
        state.errorString = action.payload?.errorString;
      });
  },
});

export const { resetApiKeysAction, clearApiKeysErrorAction } =
  apiKeysSlice.actions;
export const { reducer } = apiKeysSlice;
