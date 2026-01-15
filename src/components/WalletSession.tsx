import { useEffect } from "react";

import { useDispatch } from "react-redux";

import {
  setWalletInfoAction,
  restoreWalletSession,
  clearWalletInfoAction,
  walletSessionExpiredAction,
  startWalletSessionRestore,
  finishWalletSessionRestore,
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
      dispatch(finishWalletSessionRestore());
    }
  }, [dispatch, walletAccount.token, walletAccount.contractAddress, walletAccount.isTokenRefresh]);

  useEffect(() => {
    // Clear local storage when session expired
    if (isSessionExpired) {
      dispatch(clearWalletInfoAction());
      localStorageWalletSessionToken.remove();
      dispatch(finishWalletSessionRestore());
      return;
    }

    // Signal that we are attempting to rehydrate a wallet session from local storage.
    dispatch(startWalletSessionRestore());

    // Start session from saved token
    const sessionToken = localStorageWalletSessionToken.get();

    if (sessionToken && !isSessionExpired) {
      // Found a persisted token; hydrate the wallet state with it.
      dispatch(restoreWalletSession(sessionToken));
    } else {
      // No token means the user is logged out; stop the restore flow so login can render.
      dispatch(finishWalletSessionRestore());
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
