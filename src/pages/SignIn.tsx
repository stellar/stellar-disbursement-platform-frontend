import { useEffect, useState, useRef } from "react";
import Recaptcha from "react-google-recaptcha";
import { Heading, Input, Button, Notification, Link } from "@stellar/design-system";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

import { AppDispatch, resetStoreAction } from "store";
import { signInAction } from "store/ducks/userAccount";
import { USE_SSO, RECAPTCHA_SITE_KEY, SINGLE_TENANT_MODE } from "constants/envVariables";
import { Routes, LOCAL_STORAGE_DEVICE_ID, ORG_NAME_INFO_TEXT } from "constants/settings";
import { useRedux } from "hooks/useRedux";
import { signInRedirect } from "helpers/singleSingOn";
import { getSdpTenantName } from "helpers/getSdpTenantName";
import { localStorageTenantName } from "helpers/localStorageTenantName";
import { InfoTooltip } from "components/InfoTooltip";
import { ErrorWithExtras } from "components/ErrorWithExtras";

export const SignIn = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const recaptchaRef = useRef<Recaptcha>(null);

  const { userAccount } = useRedux("userAccount");
  const [organizationName, setOrganizationName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [showPasswordResetSuccess, setShowPasswordResetSuccess] = useState(
    Boolean(location.state?.didResetPassword),
  );

  const isSessionExpired = userAccount.isSessionExpired;

  useEffect(() => {
    setOrganizationName(getSdpTenantName());
  }, []);

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
      setShowPasswordResetSuccess(false);
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
    setShowPasswordResetSuccess,
  ]);

  useEffect(() => {
    if (userAccount.isAuthenticated && !userAccount.needsMFA) {
      setShowPasswordResetSuccess(false);
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
    showPasswordResetSuccess,
  ]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch(resetStoreAction());

    const headers = {
      "Device-ID": deviceId,
      "SDP-Tenant-Name": getSdpTenantName(organizationName),
    };

    dispatch(signInAction({ email, password, recaptchaToken, headers }));
    localStorageTenantName.set(organizationName);
    recaptchaRef.current?.reset();
  };

  const onRecaptchaSubmit = (token: string | null) => {
    if (token) {
      setRecaptchaToken(token);
    }
  };

  const goToForgotPassword = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    event.preventDefault();
    navigate(Routes.FORGOT_PASSWORD);
  };

  return (
    <>
      <div className="CardLayout">
        {showPasswordResetSuccess && (
          <Notification variant="success" title="Password Reset Successful">
            Your password has been reset successfully. Please log in with your new password.
          </Notification>
        )}
        {isSessionExpired && (
          <Notification variant="primary" title="Session expired, please sign in again" />
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
              {SINGLE_TENANT_MODE ? null : (
                <Input
                  fieldSize="sm"
                  id="si-organization-name"
                  name="si-organization-name"
                  label={<InfoTooltip infoText={ORG_NAME_INFO_TEXT}>Organization name</InfoTooltip>}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  value={organizationName}
                  type="text"
                />
              )}
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
            <Button variant="tertiary" size="md" type="button" onClick={signInRedirect}>
              Single Sign On
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              type="submit"
              disabled={!organizationName || !email || !password || !recaptchaToken}
              isLoading={userAccount.status === "PENDING"}
              data-callback="onRecaptchaSubmit"
            >
              Sign in
            </Button>
          )}

          <Link role="button" size="sm" variant="primary" onClick={goToForgotPassword}>
            Forgot Password?
          </Link>
        </form>
      </div>
    </>
  );
};
