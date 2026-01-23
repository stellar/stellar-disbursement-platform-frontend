import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { refreshWalletSessionToken } from "@/helpers/refreshWalletSessionToken";
import { useRedux } from "@/hooks/useRedux";
import { AppDispatch } from "@/store";

const TOKEN_REFRESH_INTERVAL = 2 * 60_000; // 2 minutes

export const WalletSessionRefresher = () => {
  const { walletAccount } = useRedux("walletAccount");
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    if (!walletAccount.token || walletAccount.isSessionExpired) {
      return;
    }

    const tickerId = window.setInterval(() => {
      try {
        refreshWalletSessionToken(dispatch);
      } catch (error) {
        console.error("Error refreshing wallet session token: ", error);
      }
    }, TOKEN_REFRESH_INTERVAL);

    return () => window.clearInterval(tickerId);
  }, [dispatch, walletAccount.token, walletAccount.isSessionExpired]);

  return null;
};
