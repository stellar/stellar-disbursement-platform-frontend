import { configureStore, isPlain, createAction } from "@reduxjs/toolkit";
import { combineReducers, Action, Reducer } from "redux";
import { BigNumber } from "bignumber.js";

import { RESET_STORE_ACTION_TYPE } from "constants/settings";

import { reducer as disbursementDetails } from "store/ducks/disbursementDetails";
import { reducer as disbursementDrafts } from "store/ducks/disbursementDrafts";
import { reducer as disbursements } from "store/ducks/disbursements";
import { reducer as organization } from "store/ducks/organization";
import { reducer as profile } from "store/ducks/profile";
import { reducer as userAccount } from "store/ducks/userAccount";
import { reducer as apiKeys } from "store/ducks/apiKeys";
import { reducer as apiKeyDetails } from "store/ducks/apiKeyDetails";

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

const isSerializable = (value: any) =>
  BigNumber.isBigNumber(value) || isPlain(value);

// Combine reducers to let TypeScript infer the global state
const reducers = combineReducers({
  disbursementDetails,
  disbursementDrafts,
  disbursements,
  organization,
  profile,
  userAccount,
  apiKeys,
  apiKeyDetails,
});

// Create a reset action
export const resetStoreAction = createAction(RESET_STORE_ACTION_TYPE);

// Define rootReducer without explicitly typing GlobalStates
const rootReducer: Reducer<ReturnType<typeof reducers>, Action> = (
  state,
  action: Action,
) => {
  // When resetting state for expired session, keep the isSessionExpired flag set
  const resetState = state?.userAccount?.isSessionExpired
    ? { userAccount: { isSessionExpired: true } }
    : undefined;

  const newState = action.type === RESET_STORE_ACTION_TYPE ? resetState : state;
  return reducers(newState as ReturnType<typeof reducers> | undefined, action);
};

// Configure store
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        isSerializable,
      },
    }),
});
