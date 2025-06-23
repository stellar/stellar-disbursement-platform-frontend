import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "store";

import { endSessionIfTokenInvalid } from "helpers/endSessionIfTokenInvalid";
import { refreshSessionToken } from "helpers/refreshSessionToken";
import { normalizeApiError } from "helpers/normalizeApiError";
import { getApiKeys } from "api/getApiKeys";
import { postApiKey } from "api/postApiKey";
import { deleteApiKey } from "api/deleteApiKey";
import { updateApiKey, UpdateApiKeyRequest } from "api/updateApiKey";

import {
  ApiKey,
  ApiKeysInitialState,
  ApiError,
  RejectMessage,
  CreateApiKeyRequest,
} from "types";

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

export const updateApiKeyAction = createAsyncThunk<
  string,
  { apiKeyId: string; updateData: UpdateApiKeyRequest },
  { rejectValue: RejectMessage; state: RootState }
>(
  "apiKeys/updateApiKeyAction",
  async ({ apiKeyId, updateData }, { rejectWithValue, getState, dispatch }) => {
    const { token } = getState().userAccount;

    try {
      await updateApiKey(token, apiKeyId, updateData);
      refreshSessionToken(dispatch);

      return apiKeyId;
    } catch (error: unknown) {
      const apiError = normalizeApiError(error as ApiError);
      const errorString = apiError.message;
      endSessionIfTokenInvalid(errorString, dispatch);

      return rejectWithValue({
        errorString: `Error updating API key: ${errorString}`,
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
      })
      // Update API Key
      .addCase(updateApiKeyAction.pending, (state) => {
        state.status = "PENDING";
        state.errorString = undefined;
      })
      .addCase(updateApiKeyAction.fulfilled, (state, action) => {
        state.status = "SUCCESS";
        // Optimistically update the item with the data we sent
        const { apiKeyId, updateData } = action.meta.arg;
        const index = state.items.findIndex((item) => item.id === apiKeyId);
        if (index !== -1) {
          state.items[index] = {
            ...state.items[index],
            permissions: updateData.permissions,
            allowed_ips: updateData.allowed_ips || [],
          };
        }
        state.errorString = undefined;
      })
      .addCase(updateApiKeyAction.rejected, (state, action) => {
        state.status = "ERROR";
        state.errorString = action.payload?.errorString;
      });
  },
});

export const { resetApiKeysAction, clearApiKeysErrorAction } =
  apiKeysSlice.actions;
export const { reducer } = apiKeysSlice;
