import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { SESSION_EXPIRED_EVENT } from "@/constants/settings";
import { AppDispatch, resetStoreAction } from "@/store";
import {
  setUserInfoAction,
  restoreUserSession,
  sessionExpiredAction,
} from "@/store/ducks/userAccount";
import { parseJwt } from "@/helpers/parseJwt";
import { localStorageSelectedWallet } from "@/helpers/localStorageSelectedWallet";
import { localStorageSessionToken } from "@/helpers/localStorageSessionToken";
import { useRedux } from "@/hooks/useRedux";
import { getProfileInfoAction } from "@/store/ducks/profile";
import { getOrgInfoAction, getOrgLogoAction } from "@/store/ducks/organization";

export const UserSession = () => {
  const { userAccount, profile, organization } = useRedux("userAccount", "profile", "organization");
  const dispatch: AppDispatch = useDispatch();

  const isSessionExpired = userAccount.isSessionExpired;

  useEffect(() => {
    if (userAccount.token) {
      if (!profile.data.email) {
        dispatch(getProfileInfoAction());
      }

      if (!organization.data.name) {
        dispatch(getOrgInfoAction());
        dispatch(getOrgLogoAction());
      }
    }
  }, [dispatch, organization.data.name, profile.data.email, userAccount.token]);

  useEffect(() => {
    return () => {
      if (organization.data.logo) {
        URL.revokeObjectURL(organization.data.logo);
      }
    };
  }, [organization.data.logo]);

  useEffect(() => {
    if (userAccount.isTokenRefresh) {
      // Update refresh token, other info won't change
      if (userAccount.token) {
        localStorageSessionToken.set(userAccount.token);
      } else {
        localStorageSessionToken.remove();
      }
    } else {
      // Set user info on login or page refresh only once
      if (userAccount.token && !userAccount.email) {
        const parsedToken = parseJwt(userAccount.token);
        dispatch(setUserInfoAction(parsedToken.user));
        if (userAccount.token) {
          localStorageSessionToken.set(userAccount.token);
        } else {
          localStorageSessionToken.remove();
        }
      } else if (
        // Clear user info on logout
        !userAccount.token &&
        userAccount.status === "SUCCESS"
      ) {
        dispatch(resetStoreAction());
        // Always before the token: the selected-account key is derived from the signed-in
        // user, so clearing the token first would compute a different key and orphan the
        // entry — leaving the next user on this browser scoped to the previous one's account.
        localStorageSelectedWallet.remove();
        localStorageSessionToken.remove();
      }
    }
  }, [
    dispatch,
    userAccount.email,
    userAccount.isTokenRefresh,
    userAccount.status,
    userAccount.token,
  ]);

  useEffect(() => {
    // Clear local storage when session expired
    if (isSessionExpired) {
      dispatch(resetStoreAction());
      localStorageSelectedWallet.remove();
      localStorageSessionToken.remove();
      return;
    }

    // Start session from saved token
    const sessionToken = localStorageSessionToken.get();

    if (sessionToken && !isSessionExpired) {
      dispatch(restoreUserSession(sessionToken));
    }
  }, [dispatch, isSessionExpired]);

  // Custom trigger
  useEffect(() => {
    const onSessionExpired = () => {
      dispatch(sessionExpiredAction());
      localStorageSelectedWallet.remove();
      localStorageSessionToken.remove();
    };

    document.addEventListener(SESSION_EXPIRED_EVENT, onSessionExpired);

    return () => {
      document.removeEventListener(SESSION_EXPIRED_EVENT, onSessionExpired);
    };
  }, [dispatch]);

  return null;
};
