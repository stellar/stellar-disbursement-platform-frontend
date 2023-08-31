import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "store";
import { ApiError, ForgotPasswordInitialState, RejectMessage } from "types";
import { postForgotPassword } from "api/postForgotPassword";
import { postResetPassword } from "api/postResetPassword";
import { patchProfilePassword } from "api/patchProfilePassword";
import { handleApiErrorString } from "api/handleApiErrorString";
import { endSessionIfTokenInvalid } from "helpers/endSessionIfTokenInvalid";

export const sendResetPasswordLinkAction = createAsyncThunk<
  string,
  { email: string; recaptchaToken: string },
  { rejectValue: RejectMessage; state: RootState }
>(
  "forgotPassword/sendResetPasswordLinkAction",
  async ({ email, recaptchaToken }, { rejectWithValue }) => {
    try {
      const response = await postForgotPassword(email, recaptchaToken);
      return response.message;
    } catch (error: unknown) {
      const errorString = handleApiErrorString(error as ApiError);

      return rejectWithValue({
        errorString: `Error sending reset password link: ${errorString}`,
      });
    }
  },
);

export const resetPasswordAction = createAsyncThunk<
  string,
  { password: string; confirmationToken: string },
  { rejectValue: RejectMessage; state: RootState }
>(
  "forgotPassword/resetPasswordAction",
  async ({ password, confirmationToken }, { rejectWithValue }) => {
    try {
      await postResetPassword(password, confirmationToken);
      return "";
    } catch (error: unknown) {
      const errorString = handleApiErrorString(error as ApiError);

      return rejectWithValue({
        errorString: `Error resetting password: ${errorString}`,
      });
    }
  },
);

export const setNewPasswordAction = createAsyncThunk<
  string,
  { currentPassword: string; newPassword: string },
  { rejectValue: RejectMessage; state: RootState }
>(
  "forgotPassword/setNewPasswordAction",
  async (
    { currentPassword, newPassword },
    { rejectWithValue, getState, dispatch },
  ) => {
    const { token } = getState().userAccount;
    try {
      const response = await patchProfilePassword(token, {
        currentPassword,
        newPassword,
      });
      return response.message;
    } catch (error: unknown) {
      const err = error as ApiError;
      const errorString = handleApiErrorString(error as ApiError);
      endSessionIfTokenInvalid(errorString, dispatch);

      return rejectWithValue({
        errorString: `Error resetting password: ${errorString}`,
        errorExtras: err?.extras,
      });
    }
  },
);

const initialState: ForgotPasswordInitialState = {
  response: undefined,
  status: undefined,
  errorString: undefined,
  errorExtras: undefined,
};

const forgotPasswordSlice = createSlice({
  name: "forgotPassword",
  initialState,
  reducers: {
    resetForgotPasswordAction: () => initialState,
  },
  extraReducers: (builder) => {
    // Forgot password
    builder.addCase(
      sendResetPasswordLinkAction.pending,
      (state = initialState) => {
        state.status = "PENDING";
      },
    );
    builder.addCase(sendResetPasswordLinkAction.fulfilled, (state, action) => {
      state.response = action.payload;
      state.status = "SUCCESS";
      state.errorString = undefined;
    });
    builder.addCase(sendResetPasswordLinkAction.rejected, (state, action) => {
      state.status = "ERROR";
      state.errorString = action.payload?.errorString;
    });
    // Reset password
    builder.addCase(resetPasswordAction.pending, (state = initialState) => {
      state.status = "PENDING";
    });
    builder.addCase(resetPasswordAction.fulfilled, (state, action) => {
      state.response = action.payload;
      state.status = "SUCCESS";
      state.errorString = undefined;
    });
    builder.addCase(resetPasswordAction.rejected, (state, action) => {
      state.status = "ERROR";
      state.errorString = action.payload?.errorString;
    });
    //Set New Passsword
    builder.addCase(setNewPasswordAction.pending, (state = initialState) => {
      state.response = undefined;
      state.status = "PENDING";
      state.errorString = undefined;
      state.errorExtras = undefined;
    });
    builder.addCase(setNewPasswordAction.fulfilled, (state, action) => {
      state.response = action.payload;
      state.status = "SUCCESS";
    });
    builder.addCase(setNewPasswordAction.rejected, (state, action) => {
      state.status = "ERROR";
      state.errorString = action.payload?.errorString;
      state.errorExtras = action.payload?.errorExtras;
    });
  },
});

export const forgotPasswordSelector = (state: RootState) =>
  state.forgotPassword;
export const { reducer } = forgotPasswordSlice;
export const { resetForgotPasswordAction } = forgotPasswordSlice.actions;
