import { AppDispatch } from "@/store";
import { refreshWalletTokenAction } from "@/store/ducks/walletAccount";

export const refreshWalletSessionToken = (dispatch: AppDispatch) => {
  dispatch(refreshWalletTokenAction());
};
