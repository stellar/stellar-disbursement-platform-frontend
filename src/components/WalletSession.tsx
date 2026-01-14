import { useEffect } from "react";

import { useDispatch } from "react-redux";

import {
  setWalletInfoAction,
  restoreWalletSession,
  clearWalletInfoAction,
  walletSessionExpiredAction,
} from "@/store/ducks/walletAccount";

import { WALLET_SESSION_EXPIRED_EVENT } from "@/constants/settings";

import { localStorageWalletSessionToken } from "@/helpers/localStorageWalletSessionToken";
import { parseJwt } from "@/helpers/parseJwt";

import { useRedux } from "@/hooks/useRedux";

import { AppDispatch } from "@/store";

export const WalletSession = () => {
  const { walletAccount } = useRedux("walletAccount");
  const dispatch: AppDispatch = useDispatch();

  const isSessionExpired = walletAccount.isSessionExpired;

  // Sync token between Redux and localStorage
  useEffect(() => {
    if (walletAccount.token) {
      const shouldSyncInfo = !walletAccount.contractAddress || walletAccount.isTokenRefresh;

      if (shouldSyncInfo) {
        const parsedToken = parseJwt(walletAccount.token);
        if (parsedToken.contract_address) {
          dispatch(setWalletInfoAction(parsedToken));
        }
      }

      localStorageWalletSessionToken.set(walletAccount.token);
    } else if (!walletAccount.token && walletAccount.contractAddress) {
      // Clear wallet info on logout
      dispatch(clearWalletInfoAction());
      localStorageWalletSessionToken.remove();
    }
  }, [dispatch, walletAccount.token, walletAccount.contractAddress, walletAccount.isTokenRefresh]);

  useEffect(() => {
    // Clear local storage when session expired
    if (isSessionExpired) {
      dispatch(clearWalletInfoAction());
      localStorageWalletSessionToken.remove();
      return;
    }

    // Start session from saved token
    const sessionToken = localStorageWalletSessionToken.get();

    if (sessionToken && !isSessionExpired) {
      dispatch(restoreWalletSession(sessionToken));
    }
  }, [dispatch, isSessionExpired]);

  // Custom trigger
  useEffect(() => {
    const onSessionExpired = () => {
      dispatch(walletSessionExpiredAction());
      localStorageWalletSessionToken.remove();
    };

    document.addEventListener(WALLET_SESSION_EXPIRED_EVENT, onSessionExpired);

    return () => {
      document.removeEventListener(WALLET_SESSION_EXPIRED_EVENT, onSessionExpired);
    };
  }, [dispatch]);

  return null;
};
