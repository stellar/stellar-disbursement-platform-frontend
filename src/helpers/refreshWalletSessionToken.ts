import { refreshWalletTokenAction } from "@/store/ducks/walletAccount";

import { AppDispatch } from "@/store";

export const refreshWalletSessionToken = (dispatch: AppDispatch) => {
  dispatch(refreshWalletTokenAction());
};
