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

      localStorageWalletSessionToken.set({
        token: walletAccount.token,
        isVerificationPending: walletAccount.isVerificationPending,
        pendingAsset: walletAccount.pendingAsset,
      });
    } else if (!walletAccount.token && walletAccount.contractAddress) {
      // Clear wallet info on logout
      dispatch(clearWalletInfoAction());
      localStorageWalletSessionToken.remove();
    }
  }, [
    dispatch,
    walletAccount.token,
    walletAccount.contractAddress,
    walletAccount.isTokenRefresh,
    walletAccount.isVerificationPending,
    walletAccount.pendingAsset,
  ]);

  useEffect(() => {
    // Clear local storage when session expired
    if (isSessionExpired) {
      dispatch(clearWalletInfoAction());
      localStorageWalletSessionToken.remove();
      return;
    }

    // Start session from saved token
    const storedSession = localStorageWalletSessionToken.get();

    if (storedSession?.token && !isSessionExpired) {
      dispatch(restoreWalletSession(storedSession));
    }
  }, [dispatch, isSessionExpired]);

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
