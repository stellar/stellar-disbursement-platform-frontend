import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { SESSION_EXPIRED_EVENT } from "@/constants/settings";
import { localStorageWalletSessionToken } from "@/helpers/localStorageWalletSessionToken";
import { parseJwt } from "@/helpers/parseJwt";
import { useRedux } from "@/hooks/useRedux";
import { AppDispatch } from "@/store";
import {
  setWalletInfoAction,
  restoreWalletSession,
  clearWalletInfoAction,
  walletSessionExpiredAction,
} from "@/store/ducks/walletAccount";

const isTokenExpired = (token: string): boolean => {
  const parsedToken = parseJwt(token);
  const exp = typeof parsedToken.exp === "number" ? parsedToken.exp : Number(parsedToken.exp);

  if (!Number.isFinite(exp)) {
    return false;
  }

  return exp <= Math.floor(Date.now() / 1000);
};

export const WalletSession = () => {
  const { walletAccount } = useRedux("walletAccount");
  const dispatch: AppDispatch = useDispatch();

  const isSessionExpired = walletAccount.isSessionExpired;

  // Sync token between Redux and localStorage
  useEffect(() => {
    if (walletAccount.token) {
      if (isTokenExpired(walletAccount.token)) {
        dispatch(walletSessionExpiredAction());
        return;
      }

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
      if (isTokenExpired(sessionToken)) {
        dispatch(walletSessionExpiredAction());
        localStorageWalletSessionToken.remove();
        return;
      }

      dispatch(restoreWalletSession(sessionToken));
    }
  }, [dispatch, isSessionExpired]);

  useEffect(() => {
    if (!walletAccount.token || walletAccount.isSessionExpired) {
      return;
    }

    const parsedToken = parseJwt(walletAccount.token);
    const exp = typeof parsedToken.exp === "number" ? parsedToken.exp : Number(parsedToken.exp);

    if (!Number.isFinite(exp)) {
      return;
    }

    const msUntilExpiry = exp * 1000 - Date.now();

    if (msUntilExpiry <= 0) {
      dispatch(walletSessionExpiredAction());
      return;
    }

    const timeoutId = window.setTimeout(() => {
      dispatch(walletSessionExpiredAction());
    }, msUntilExpiry);

    return () => window.clearTimeout(timeoutId);
  }, [dispatch, walletAccount.isSessionExpired, walletAccount.token]);

  // Custom trigger
  useEffect(() => {
    const onSessionExpired = () => {
      dispatch(walletSessionExpiredAction());
    };

    document.addEventListener(SESSION_EXPIRED_EVENT, onSessionExpired);

    return () => {
      document.removeEventListener(SESSION_EXPIRED_EVENT, onSessionExpired);
    };
  }, [dispatch]);

  return null;
};
