import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { LOCAL_STORAGE_SESSION_TOKEN } from "constants/settings";
import { AppDispatch, resetStoreAction } from "store";
import { setUserInfoAction, restoreUserSession } from "store/ducks/userAccount";
import { parseJwt } from "helpers/parseJwt";
import { useRedux } from "hooks/useRedux";
import { getProfileInfoAction } from "store/ducks/profile";
import { getOrgInfoAction, getOrgLogoAction } from "store/ducks/organization";

export const UserSession = () => {
  const { userAccount, profile, organization } = useRedux(
    "userAccount",
    "profile",
    "organization",
  );
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
      localStorage.setItem(LOCAL_STORAGE_SESSION_TOKEN, userAccount.token);
    } else {
      // Set user info on login or page refresh only once
      if (userAccount.token && !userAccount.email) {
        const parsedToken = parseJwt(userAccount.token);
        dispatch(setUserInfoAction(parsedToken.user));
        localStorage.setItem(LOCAL_STORAGE_SESSION_TOKEN, userAccount.token);
      } else if (
        // Clear user info on logout
        !userAccount.token &&
        userAccount.status === "SUCCESS"
      ) {
        dispatch(resetStoreAction());
        localStorage.removeItem(LOCAL_STORAGE_SESSION_TOKEN);
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
      localStorage.removeItem(LOCAL_STORAGE_SESSION_TOKEN);
      return;
    }

    // Start session from saved token
    const sessionToken = localStorage.getItem(LOCAL_STORAGE_SESSION_TOKEN);

    if (sessionToken && !isSessionExpired) {
      dispatch(restoreUserSession(sessionToken));
    }
  }, [dispatch, isSessionExpired]);

  return null;
};
