import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "store";
import { singleSignOnAction } from "store/ducks/singleSignOnUserAccount";
import { authLogin } from "api/authLogin";
import { mfAuth } from "api/mfAuth";
import { refreshToken } from "api/refreshToken";
import { endSessionIfTokenInvalid } from "helpers/endSessionIfTokenInvalid";
import { normalizeApiError } from "helpers/normalizeApiError";
import {
  ApiError,
  JwtUser,
  RejectMessage,
  UserAccountInitialState,
} from "types";

export const signInAction = createAsyncThunk<
  { token: string | null; message: string } | string,
  {
    email: string;
    password: string;
    recaptchaToken: string;
    headers: Record<string, string>;
  },
  { rejectValue: RejectMessage; state: RootState }
>(
  "userAccount/signInAction",
  async ({ email, password, recaptchaToken, headers }, { rejectWithValue }) => {
    try {
      const response = await authLogin(
        email,
        password,
        recaptchaToken,
        headers,
      );
      return response;
    } catch (error: unknown) {
      const apiError = normalizeApiError(error as ApiError);
      const errorString = apiError.message;

      return rejectWithValue({
        errorString,
      });
    }
  },
);

export const refreshTokenAction = createAsyncThunk<
  string,
  undefined,
  { rejectValue: RejectMessage; state: RootState }
>(
  "userAccount/refreshTokenAction",
  async (_, { rejectWithValue, getState, dispatch }) => {
    const { token } = getState().userAccount;

    try {
      const newToken = await refreshToken(token);
      return newToken;
    } catch (error: unknown) {
      const apiError = normalizeApiError(error as ApiError);
      const errorString = apiError.message;
      endSessionIfTokenInvalid(errorString, dispatch);

      return rejectWithValue({
        errorString,
      });
    }
  },
);

export const mfaAction = createAsyncThunk<
  { token: string | null; message: string } | string,
  {
    mfaCode: string;
    rememberMe: boolean;
    recaptchaToken: string;
    headers: Record<string, string>;
  },
  { rejectValue: RejectMessage; state: RootState }
>(
  "userAccount/mfaAction",
  async (
    { mfaCode, rememberMe, recaptchaToken, headers },
    { rejectWithValue },
  ) => {
    try {
      const response = await mfAuth(
        mfaCode,
        rememberMe,
        recaptchaToken,
        headers,
      );
      return response;
    } catch (error: unknown) {
      const apiError = normalizeApiError(error as ApiError);
      const errorString = apiError.message;

      return rejectWithValue({
        errorString,
      });
    }
  },
);

const initialState: UserAccountInitialState = {
  token: "",
  email: "",
  role: null,
  isAuthenticated: false,
  needsMFA: null,
  isSessionExpired: false,
  isTokenRefresh: false,
  status: undefined,
  errorString: undefined,
  restoredPathname: undefined,
};

const userAccountSlice = createSlice({
  name: "userAccount",
  initialState,
  reducers: {
    setUserInfoAction: (state, { payload }: PayloadAction<JwtUser>) => {
      state.email = payload.email;
      state.role = payload.roles?.[0] || null;
      state.isAuthenticated = true;
    },
    clearUserInfoAction: () => initialState,
    restoreUserSession: (state, action) => {
      state.token = action.payload;

      // We need this to stay on the current route when page is refreshed
      if (location.pathname !== "/") {
        state.restoredPathname = location.pathname;
      }
    },
    sessionExpiredAction: (state) => {
      state.isSessionExpired = true;
    },
  },
  extraReducers: (builder) => {
    // signInAction
    builder.addCase(signInAction.pending, (state = initialState) => {
      state.status = "PENDING";
    });
    builder.addCase(signInAction.fulfilled, (state, action) => {
      if (typeof action.payload != "object") return;
      state.isAuthenticated = true;
      state.isSessionExpired = false;
      state.isTokenRefresh = false;
      state.status = "SUCCESS";
      state.token = action.payload.token ?? "";
      state.needsMFA = !action.payload.token;
    });
    builder.addCase(signInAction.rejected, (state, action) => {
      state.status = "ERROR";
      state.errorString = action.payload?.errorString;
    });

    // refreshTokenAction
    builder.addCase(refreshTokenAction.pending, (state = initialState) => {
      state.status = "PENDING";
    });
    builder.addCase(refreshTokenAction.fulfilled, (state, action) => {
      state.token = action.payload;
      state.isTokenRefresh = true;
      state.status = "SUCCESS";
    });
    builder.addCase(refreshTokenAction.rejected, (state, action) => {
      state.status = "ERROR";
      state.errorString = action.payload?.errorString;
    });

    // singleSignOnAction
    builder.addCase(singleSignOnAction.pending, (state = initialState) => {
      state.status = "PENDING";
    });
    builder.addCase(singleSignOnAction.fulfilled, (state, action) => {
      state.token = action.payload?.token as string;
      state.email = action.payload?.email as string;
      // TODO: SSO: handle role
      state.isAuthenticated = true;
      state.isSessionExpired = false;
      state.isTokenRefresh = false;
      state.status = "SUCCESS";
      state.errorString = "";
    });
    builder.addCase(singleSignOnAction.rejected, (state, action) => {
      state.token = "";
      state.email = "";
      state.role = null;
      state.isAuthenticated = false;
      state.isSessionExpired = false;
      state.status = "ERROR";
      state.errorString = action.payload?.error_description;
    });

    // mfaAction
    builder.addCase(mfaAction.pending, (state = initialState) => {
      state.status = "PENDING";
    });
    builder.addCase(mfaAction.fulfilled, (state, action) => {
      if (typeof action.payload != "object") return;
      state.isAuthenticated = true;
      state.isSessionExpired = false;
      state.isTokenRefresh = false;
      state.status = "SUCCESS";
      state.token = action.payload.token ?? "";
      state.needsMFA = !action.payload.token;
    });
    builder.addCase(mfaAction.rejected, (state, action) => {
      state.status = "ERROR";
      state.errorString = action.payload?.errorString;
    });
  },
});

export const userAccountSelector = (state: RootState) => state.userAccount;

export const { reducer } = userAccountSlice;
export const {
  setUserInfoAction,
  clearUserInfoAction,
  restoreUserSession,
  sessionExpiredAction,
} = userAccountSlice.actions;
