import { useEffect, useState, useRef } from "react";
import Recaptcha from "react-google-recaptcha";
import {
  Heading,
  Input,
  Button,
  Notification,
  Link,
} from "@stellar/design-system";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

import { AppDispatch, resetStoreAction } from "store";
import { signInAction } from "store/ducks/userAccount";
import {
  Routes,
  USE_SSO,
  RECAPTCHA_SITE_KEY,
  LOCAL_STORAGE_DEVICE_ID,
} from "constants/settings";
import { useRedux } from "hooks/useRedux";
import { signInRedirect } from "helpers/singleSingOn";
import { ErrorWithExtras } from "components/ErrorWithExtras";

export const SignIn = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const recaptchaRef = useRef<Recaptcha>(null);

  const { userAccount } = useRedux("userAccount");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const [deviceId, setDeviceId] = useState("");

  const isSessionExpired = userAccount.isSessionExpired;

  useEffect(() => {
    const storedDeviceId = localStorage.getItem(LOCAL_STORAGE_DEVICE_ID);
    if (!storedDeviceId) {
      const newDeviceId = uuidv4();
      localStorage.setItem(LOCAL_STORAGE_DEVICE_ID, newDeviceId);
      setDeviceId(newDeviceId);
    } else {
      setDeviceId(storedDeviceId);
    }
  }, [deviceId]);

  useEffect(() => {
    if (userAccount.isAuthenticated && userAccount.needsMFA) {
      navigate(
        {
          pathname: Routes.MFA,
          search: location.search,
        },
        { state: { email, password } },
      );
    }
  }, [
    location.search,
    navigate,
    userAccount.restoredPathname,
    userAccount.isAuthenticated,
    userAccount.needsMFA,
    email,
    password,
  ]);

  useEffect(() => {
    if (userAccount.isAuthenticated && !userAccount.needsMFA) {
      navigate({
        pathname: userAccount.restoredPathname ?? Routes.HOME,
        search: location.search,
      });
    }
  }, [
    location.search,
    navigate,
    userAccount.isAuthenticated,
    userAccount.restoredPathname,
    userAccount.needsMFA,
  ]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch(resetStoreAction());

    const headers = {
      "Device-ID": deviceId,
    };

    dispatch(signInAction({ email, password, recaptchaToken, headers }));
    recaptchaRef.current?.reset();
  };

  const onRecaptchaSubmit = (token: string | null) => {
    if (token) {
      setRecaptchaToken(token);
    }
  };

  const goToForgotPassword = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
  ) => {
    event.preventDefault();
    navigate(Routes.FORGOT_PASSWORD);
  };

  return (
    <>
      <div className="CardLayout">
        {isSessionExpired && (
          <Notification
            variant="primary"
            title="Session expired, please sign in again"
          />
        )}
        {!isSessionExpired && userAccount.errorString && (
          <Notification variant="error" title="Sign in error">
            <ErrorWithExtras
              appError={{
                message: userAccount.errorString,
              }}
            />
          </Notification>
        )}

        <form onSubmit={handleSubmit}>
          <Heading size="sm" as="h1">
            Sign in to Stellar Disbursement Platform
          </Heading>
          {!USE_SSO && (
            <>
              <Input
                fieldSize="sm"
                id="si-email"
                name="si-email"
                label="Email address"
                onChange={(e) => setEmail(e.target.value)}
                type="email"
              />
              <Input
                fieldSize="sm"
                id="si-password"
                name="si-password"
                label="Password"
                isPassword
                onChange={(e) => setPassword(e.target.value)}
              />
              <Recaptcha
                ref={recaptchaRef}
                size="normal"
                sitekey={RECAPTCHA_SITE_KEY}
                onChange={onRecaptchaSubmit}
              />
            </>
          )}
          {USE_SSO ? (
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={signInRedirect}
            >
              Single Sign On
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              type="submit"
              disabled={!email || !password || !recaptchaToken}
              isLoading={userAccount.status === "PENDING"}
              data-callback="onRecaptchaSubmit"
            >
              Sign in
            </Button>
          )}

          <Link
            role="button"
            size="sm"
            variant="primary"
            onClick={goToForgotPassword}
          >
            Forgot Password?
          </Link>
        </form>
      </div>
    </>
  );
};
