import { useEffect, useRef, useState } from "react";
import Recaptcha from "react-google-recaptcha";
import { Heading, Input, Button, Notification, Link, Checkbox } from "@stellar/design-system";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

import { AppDispatch, resetStoreAction } from "store";
import { USE_SSO, RECAPTCHA_SITE_KEY, SINGLE_TENANT_MODE } from "constants/envVariables";
import { Routes, LOCAL_STORAGE_DEVICE_ID, ORG_NAME_INFO_TEXT } from "constants/settings";
import { useRedux } from "hooks/useRedux";
import { mfaAction, signInAction } from "store/ducks/userAccount";
import { getSdpTenantName } from "helpers/getSdpTenantName";
import { InfoTooltip } from "components/InfoTooltip";
import { ErrorWithExtras } from "components/ErrorWithExtras";

export const MFAuth = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const recaptchaRef = useRef<Recaptcha>(null);

  const { userAccount } = useRedux("userAccount");
  const [organizationName, setOrganizationName] = useState(getSdpTenantName());
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [deviceId, setDeviceId] = useState("");

  const { email, password } = location.state;

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
    if (userAccount.isAuthenticated) {
      navigate({
        pathname: userAccount.restoredPathname ?? Routes.HOME,
        search: location.search,
      });
    }
  }, [location.search, navigate, userAccount.isAuthenticated, userAccount.restoredPathname]);

  const onRecaptchaSubmit = (token: string | null) => {
    if (token) {
      setRecaptchaToken(token);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch(resetStoreAction());

    const headers = {
      "Device-ID": deviceId,
      "SDP-Tenant-Name": getSdpTenantName(organizationName),
    };

    dispatch(mfaAction({ mfaCode, rememberMe, recaptchaToken, headers }));

    recaptchaRef.current?.reset();
  };

  const resendVerificationCode = async (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    event.preventDefault();
    dispatch(resetStoreAction());

    const headers = {
      "Device-ID": deviceId,
      "SDP-Tenant-Name": getSdpTenantName(organizationName),
    };

    if (email && password) {
      dispatch(signInAction({ email, password, recaptchaToken, headers }));
    }
    recaptchaRef.current?.reset();
  };

  return (
    <>
      <div className="CardLayout">
        {userAccount.errorString && (
          <Notification variant="error" title="MFA error">
            <ErrorWithExtras
              appError={{
                message: userAccount.errorString,
              }}
            />
          </Notification>
        )}
        <form onSubmit={handleSubmit}>
          <Heading size="sm" as="h1">
            Verify your identity
          </Heading>

          <div className="Note">
            Enter the 6 digit code that was sent to your email. Didn’t get anything?{" "}
            <Link role="button" size="sm" variant="primary" onClick={resendVerificationCode}>
              Resend code
            </Link>
          </div>

          {!USE_SSO && (
            <>
              {SINGLE_TENANT_MODE ? null : (
                <Input
                  fieldSize="sm"
                  id="2fa-organization-name"
                  name="2fa-organization-name"
                  label={<InfoTooltip infoText={ORG_NAME_INFO_TEXT}>Organization name</InfoTooltip>}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  value={organizationName}
                  type="text"
                />
              )}
              <Input
                fieldSize="sm"
                id="2fa-verification-code"
                name="2fa-verification-code"
                label="Verification Code"
                placeholder="000000"
                onChange={(e) => setMfaCode(e.target.value)}
                type="text"
              />

              <Checkbox
                fieldSize="sm"
                id="2fa-remember-me"
                label="Remember me"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />

              <Recaptcha
                ref={recaptchaRef}
                size="normal"
                sitekey={RECAPTCHA_SITE_KEY}
                onChange={onRecaptchaSubmit}
              />

              <Button
                variant="primary"
                size="md"
                type="submit"
                disabled={!organizationName || !mfaCode || !recaptchaToken}
                isLoading={userAccount.status === "PENDING"}
                data-callback="onRecaptchaSubmit"
              >
                Submit
              </Button>
            </>
          )}
        </form>
      </div>
    </>
  );
};
