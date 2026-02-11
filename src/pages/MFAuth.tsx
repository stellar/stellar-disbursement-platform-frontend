import { useEffect, useRef, useState } from "react";

import Recaptcha from "react-google-recaptcha";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

import { Heading, Input, Button, Notification, Link, Checkbox } from "@stellar/design-system";

import { ErrorWithExtras } from "@/components/ErrorWithExtras";
import { InfoTooltip } from "@/components/InfoTooltip";

import { mfaAction, signInAction } from "@/store/ducks/userAccount";

import { USE_SSO, SINGLE_TENANT_MODE } from "@/constants/envVariables";
import { Routes, LOCAL_STORAGE_DEVICE_ID, ORG_NAME_INFO_TEXT } from "@/constants/settings";

import { getSdpTenantName } from "@/helpers/getSdpTenantName";

import { useCaptcha } from "@/hooks/useCaptcha";
import { useRedux } from "@/hooks/useRedux";


import { AppDispatch, resetStoreAction } from "@/store";

export const MFAuth = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { userAccount } = useRedux("userAccount");
  const recaptchaRef = useRef<Recaptcha>(null);
  const captcha = useCaptcha(recaptchaRef);

  const [organizationName, setOrganizationName] = useState(getSdpTenantName());
  const [mfaCode, setMfaCode] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [deviceId, setDeviceId] = useState("");

  const { email, password } = location.state;

  useEffect(() => {
    const storedDeviceId = localStorage.getItem(LOCAL_STORAGE_DEVICE_ID);
    if (!storedDeviceId) {
      const newDeviceId = uuidv4();
      localStorage.setItem(LOCAL_STORAGE_DEVICE_ID, newDeviceId);
      // eslint-disable-next-line react-hooks/set-state-in-effect
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch(resetStoreAction());

    let recaptchaToken = "";
    try {
      recaptchaToken = await captcha.getToken("mfa");
    } catch (err) {
      console.error("reCAPTCHA failed:", err);
      return;
    }

    const headers = {
      "Device-ID": deviceId,
      "SDP-Tenant-Name": getSdpTenantName(organizationName),
    };

    dispatch(mfaAction({ mfaCode, rememberMe, recaptchaToken, headers }));
    captcha.resetCaptcha();
  };

  const resendVerificationCode = async (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    event.preventDefault();
    dispatch(resetStoreAction());

    let recaptchaToken = "";
    try {
      recaptchaToken = await captcha.getToken("login");
    } catch (err) {
      console.error("reCAPTCHA failed:", err);
      return;
    }

    const headers = {
      "Device-ID": deviceId,
      "SDP-Tenant-Name": getSdpTenantName(organizationName),
    };

    if (email && password) {
      dispatch(signInAction({ email, password, recaptchaToken, headers }));
    }
    captcha.resetCaptcha();
  };

  const handleOrgNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setOrganizationName(newValue);
    captcha.onOrgNameChange(newValue);
  };

  const handleOrgNameBlur = () => {
    captcha.onOrgNameBlur(organizationName);
  };

  return (
    <>
      <div className="CardLayout">
        {userAccount.errorString && (
          <Notification variant="error" title="MFA error" isFilled={true}>
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
            Enter the 6 digit code that was sent to your email. Didn't get anything?{" "}
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
                  onChange={handleOrgNameChange}
                  onBlur={handleOrgNameBlur}
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

              {captcha.isV2 && (
                <Recaptcha
                  ref={recaptchaRef}
                  size="normal"
                  sitekey={captcha.siteKey}
                  onChange={captcha.onRecaptchaV2Change}
                />
              )}

              <Button
                variant="primary"
                size="md"
                type="submit"
                disabled={
                  !organizationName ||
                  !mfaCode ||
                  captcha.captchaConfigLoading ||
                  (captcha.isV2 && !captcha.recaptchaToken)
                }
                isLoading={userAccount.status === "PENDING"}
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
