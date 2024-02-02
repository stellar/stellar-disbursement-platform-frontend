import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "store";
import { getProfileInfo } from "api/getProfileInfo";
import { patchProfileInfo } from "api/patchProfileInfo";
import { endSessionIfTokenInvalid } from "helpers/endSessionIfTokenInvalid";
import { refreshSessionToken } from "helpers/refreshSessionToken";
import { normalizeApiError } from "helpers/normalizeApiError";
import {
  ApiError,
  ApiProfileInfo,
  ProfileInitialState,
  RejectMessage,
} from "types";

export const getProfileInfoAction = createAsyncThunk<
  ApiProfileInfo,
  undefined,
  { rejectValue: RejectMessage; state: RootState }
>(
  "profile/getProfileInfoAction",
  async (_, { rejectWithValue, getState, dispatch }) => {
    const { token } = getState().userAccount;

    try {
      const profileInfo = await getProfileInfo(token);
      refreshSessionToken(dispatch);

      return profileInfo;
    } catch (error: unknown) {
      const apiError = normalizeApiError(error as ApiError);
      const errorString = apiError.message;
      endSessionIfTokenInvalid(errorString, dispatch);

      return rejectWithValue({
        errorString: `Error fetching profile info: ${errorString}`,
      });
    }
  },
);

export const updateProfileInfoAction = createAsyncThunk<
  string,
  { firstName?: string; lastName?: string; email?: string },
  { rejectValue: RejectMessage; state: RootState }
>(
  "profile/updateProfileInfoAction",
  async (
    { firstName, lastName, email },
    { rejectWithValue, getState, dispatch },
  ) => {
    const { token } = getState().userAccount;

    try {
      const profileInfo = await patchProfileInfo(token, {
        firstName,
        lastName,
        email,
      });
      return profileInfo.message;
    } catch (error: unknown) {
      const apiError = normalizeApiError(error as ApiError);
      const errorString = apiError.message;
      endSessionIfTokenInvalid(errorString, dispatch);

      return rejectWithValue({
        errorString: `Error updating profile info: ${errorString}`,
        errorExtras: apiError?.extras,
      });
    }
  },
);

const initialState: ProfileInitialState = {
  data: {
    id: "",
    firstName: "",
    lastName: "",
    email: "",
    role: null,
  },
  updateMessage: undefined,
  status: undefined,
  errorString: undefined,
  errorExtras: undefined,
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearUpdateMessageAction: (state) => {
      state.updateMessage = undefined;
    },
    clearErrorAction: (state) => {
      state.errorString = undefined;
      state.errorExtras = undefined;
    },
  },
  extraReducers: (builder) => {
    // Get profile
    builder.addCase(getProfileInfoAction.pending, (state = initialState) => {
      state.status = "PENDING";
      state.errorString = undefined;
      state.errorExtras = undefined;
    });
    builder.addCase(getProfileInfoAction.fulfilled, (state, action) => {
      state.data = {
        ...state.data,
        id: action.payload.id,
        firstName: action.payload.first_name,
        lastName: action.payload.last_name,
        email: action.payload.email,
        role: action.payload.roles?.[0] || null,
      };
      state.status = "SUCCESS";
    });
    builder.addCase(getProfileInfoAction.rejected, (state, action) => {
      state.status = "ERROR";
      state.errorString = action.payload?.errorString;
      state.errorExtras = action.payload?.errorExtras;
    });
    // Update profile
    builder.addCase(updateProfileInfoAction.pending, (state = initialState) => {
      state.updateMessage = undefined;
      state.status = "PENDING";
      state.errorString = undefined;
      state.errorExtras = undefined;
    });
    builder.addCase(updateProfileInfoAction.fulfilled, (state, action) => {
      state.updateMessage = action.payload;
      state.status = "SUCCESS";
    });
    builder.addCase(updateProfileInfoAction.rejected, (state, action) => {
      state.status = "ERROR";
      state.errorString = action.payload?.errorString;
      state.errorExtras = action.payload?.errorExtras;
    });
  },
});

export const profileSelector = (state: RootState) => state.profile;
export const { reducer } = profileSlice;
export const { clearUpdateMessageAction, clearErrorAction } =
  profileSlice.actions;
