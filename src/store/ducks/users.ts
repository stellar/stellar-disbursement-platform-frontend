import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "store";
import { getUsers } from "api/getUsers";
import { handleApiErrorString } from "api/handleApiErrorString";
import { patchUserStatus } from "api/patchUserStatus";
import { patchUserRole } from "api/patchUserRole";
import { endSessionIfTokenInvalid } from "helpers/endSessionIfTokenInvalid";
import { refreshSessionToken } from "helpers/refreshSessionToken";
import {
  ApiError,
  ApiNewUser,
  ApiUser,
  NewUser,
  RejectMessage,
  UserRole,
  UsersInitialState,
} from "types";
import { postUser } from "api/postUser";

export const getUsersAction = createAsyncThunk<
  ApiUser[],
  undefined,
  { rejectValue: RejectMessage; state: RootState }
>(
  "users/getUsersAction",
  async (_, { rejectWithValue, getState, dispatch }) => {
    const { token } = getState().userAccount;

    try {
      const users = await getUsers(token);
      refreshSessionToken(dispatch);

      return users;
    } catch (error: unknown) {
      const errorString = handleApiErrorString(error as ApiError);
      endSessionIfTokenInvalid(errorString, dispatch);

      return rejectWithValue({
        errorString: `Error fetching users: ${errorString}`,
      });
    }
  },
);

export const changeUserStatusAction = createAsyncThunk<
  { id: string; is_active: boolean },
  { userId: string; isActive: boolean },
  { rejectValue: RejectMessage; state: RootState }
>(
  "users/changeUserStatusAction",
  async ({ userId, isActive }, { rejectWithValue, getState, dispatch }) => {
    const { token } = getState().userAccount;

    try {
      await patchUserStatus(token, userId, isActive);
      refreshSessionToken(dispatch);

      return {
        id: userId,
        is_active: isActive,
      };
    } catch (error: unknown) {
      const errorString = handleApiErrorString(error as ApiError);
      endSessionIfTokenInvalid(errorString, dispatch);

      return rejectWithValue({
        errorString: `Error changing member's status: ${errorString}`,
      });
    }
  },
);

export const changeUserRoleAction = createAsyncThunk<
  { id: string; role: UserRole },
  { userId: string; role: UserRole },
  { rejectValue: RejectMessage; state: RootState }
>(
  "users/changeUserRoleAction",
  async ({ userId, role }, { rejectWithValue, getState, dispatch }) => {
    const { token } = getState().userAccount;

    try {
      await patchUserRole(token, userId, role);
      refreshSessionToken(dispatch);

      return {
        id: userId,
        role,
      };
    } catch (error: unknown) {
      const errorString = handleApiErrorString(error as ApiError);
      endSessionIfTokenInvalid(errorString, dispatch);

      return rejectWithValue({
        errorString: `Error changing member's role: ${errorString}`,
      });
    }
  },
);

export const createNewUserAction = createAsyncThunk<
  ApiNewUser,
  NewUser,
  { rejectValue: RejectMessage; state: RootState }
>(
  "users/createNewUserAction",
  async (
    { first_name, last_name, email, role },
    { rejectWithValue, getState, dispatch },
  ) => {
    const { token } = getState().userAccount;

    try {
      const newUser = await postUser(token, {
        first_name,
        last_name,
        email,
        role,
      });
      refreshSessionToken(dispatch);

      return newUser;
    } catch (error: unknown) {
      const errorString = handleApiErrorString(error as ApiError);
      endSessionIfTokenInvalid(errorString, dispatch);

      return rejectWithValue({
        errorString: `Error changing member's role: ${errorString}`,
      });
    }
  },
);

const initialState: UsersInitialState = {
  items: [],
  updatedUser: {
    id: "",
    role: null,
    is_active: false,
    actionType: undefined,
    status: undefined,
    errorString: undefined,
  },
  newUser: {
    id: "",
    first_name: "",
    last_name: "",
    role: null,
    email: "",
    status: undefined,
    errorString: undefined,
  },
  status: undefined,
  errorString: undefined,
};

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    resetUpdatedUserAction: (state) => {
      state.updatedUser = {
        id: "",
        role: null,
        is_active: false,
        actionType: undefined,
        status: undefined,
        errorString: undefined,
      };
    },
    resetNewUserAction: (state) => {
      state.newUser = {
        id: "",
        first_name: "",
        last_name: "",
        role: null,
        email: "",
        status: undefined,
        errorString: undefined,
      };
    },
  },
  extraReducers: (builder) => {
    // Get users
    builder.addCase(getUsersAction.pending, (state = initialState) => {
      state.status = "PENDING";
    });
    builder.addCase(getUsersAction.fulfilled, (state, action) => {
      state.items = action.payload;
      state.status = "SUCCESS";
      state.errorString = undefined;
    });
    builder.addCase(getUsersAction.rejected, (state, action) => {
      state.status = "ERROR";
      state.errorString = action.payload?.errorString;
    });
    // Change user's status (active or inactive)
    builder.addCase(changeUserStatusAction.pending, (state = initialState) => {
      state.updatedUser.status = "PENDING";
      state.updatedUser.errorString = undefined;
    });
    builder.addCase(changeUserStatusAction.fulfilled, (state, action) => {
      state.updatedUser.id = action.payload.id;
      state.updatedUser.is_active = action.payload.is_active;
      state.updatedUser.actionType = "status";
      state.updatedUser.status = "SUCCESS";
    });
    builder.addCase(changeUserStatusAction.rejected, (state, action) => {
      state.updatedUser.status = "ERROR";
      state.updatedUser.errorString = action.payload?.errorString;
    });
    // Change user's role
    builder.addCase(changeUserRoleAction.pending, (state = initialState) => {
      state.updatedUser.status = "PENDING";
      state.updatedUser.errorString = undefined;
    });
    builder.addCase(changeUserRoleAction.fulfilled, (state, action) => {
      state.updatedUser.id = action.payload.id;
      state.updatedUser.role = action.payload.role;
      state.updatedUser.actionType = "role";
      state.updatedUser.status = "SUCCESS";
    });
    builder.addCase(changeUserRoleAction.rejected, (state, action) => {
      state.updatedUser.status = "ERROR";
      state.updatedUser.errorString = action.payload?.errorString;
    });
    // Create user
    builder.addCase(createNewUserAction.pending, (state = initialState) => {
      state.newUser.status = "PENDING";
      state.newUser.errorString = undefined;
    });
    builder.addCase(createNewUserAction.fulfilled, (state, action) => {
      state.newUser.id = action.payload.id;
      state.newUser.first_name = action.payload.first_name;
      state.newUser.last_name = action.payload.last_name;
      state.newUser.email = action.payload.email;
      state.newUser.role = action.payload.roles[0];
      state.newUser.status = "SUCCESS";
    });
    builder.addCase(createNewUserAction.rejected, (state, action) => {
      state.newUser.status = "ERROR";
      state.newUser.errorString = action.payload?.errorString;
    });
  },
});

export const usersSelector = (state: RootState) => state.users;
export const { reducer } = usersSlice;
export const { resetUpdatedUserAction, resetNewUserAction } =
  usersSlice.actions;
