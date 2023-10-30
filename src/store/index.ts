import {
  configureStore,
  isPlain,
  createAction,
  CombinedState,
} from "@reduxjs/toolkit";
import { combineReducers, Action } from "redux";
import BigNumber from "bignumber.js";

import { RESET_STORE_ACTION_TYPE } from "constants/settings";

import { reducer as assets } from "store/ducks/assets";
import { reducer as countries } from "store/ducks/countries";
import { reducer as disbursementDetails } from "store/ducks/disbursementDetails";
import { reducer as disbursementDrafts } from "store/ducks/disbursementDrafts";
import { reducer as disbursements } from "store/ducks/disbursements";
import { reducer as organization } from "store/ducks/organization";
import { reducer as profile } from "store/ducks/profile";
import { reducer as userAccount } from "store/ducks/userAccount";

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

const loggerMiddleware =
  (storeVal: any) => (next: any) => (action: Action<any>) => {
    console.log("Dispatching: ", action.type);
    const dispatchedAction = next(action);
    console.log("NEW STATE: ", storeVal.getState());
    return dispatchedAction;
  };

const isSerializable = (value: any) =>
  BigNumber.isBigNumber(value) || isPlain(value);

const reducers = combineReducers({
  assets,
  countries,
  disbursementDetails,
  disbursementDrafts,
  disbursements,
  organization,
  profile,
  userAccount,
});

export const resetStoreAction = createAction(RESET_STORE_ACTION_TYPE);

const rootReducer = (state: CombinedState<any>, action: Action) => {
  // When resetting state for expired session, we need to make sure we keep
  // isSessionExpired flag set
  const resetState = state?.userAccount?.isSessionExpired
    ? { userAccount: { isSessionExpired: true } }
    : undefined;

  const newState = action.type === RESET_STORE_ACTION_TYPE ? resetState : state;
  return reducers(newState, action);
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        isSerializable,
      },
    }).concat(loggerMiddleware),
});
