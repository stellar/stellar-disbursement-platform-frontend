import { useEffect, useRef, useState } from "react";

import Recaptcha from "react-google-recaptcha";
import { useNavigate } from "react-router-dom";

import { Heading, Input, Button, Notification, Link } from "@stellar/design-system";

import { ErrorWithExtras } from "@/components/ErrorWithExtras";
import { InfoTooltip } from "@/components/InfoTooltip";

import { SINGLE_TENANT_MODE } from "@/constants/envVariables";
import { ORG_NAME_INFO_TEXT } from "@/constants/settings";

import { useForgotPasswordLink } from "@/apiQueries/useForgotPasswordLink";

import { getSdpTenantName } from "@/helpers/getSdpTenantName";

import { useCaptcha } from "@/hooks/useCaptcha";

export const ForgotPassword = () => {
  const {
    isSuccess,
    isPending,
    isError,
    error,
    data,
    mutateAsync: sendLink,
  } = useForgotPasswordLink();

  const navigate = useNavigate();
  const recaptchaRef = useRef<Recaptcha>(null);
  const captcha = useCaptcha(recaptchaRef);

  const [organizationName, setOrganizationName] = useState(getSdpTenantName());
  const [email, setEmail] = useState("");

  const handleForgotPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    let recaptchaToken = "";
    try {
      recaptchaToken = await captcha.getToken("forgot_password");
    } catch (err) {
      console.error("reCAPTCHA failed:", err);
      return;
    }

    sendLink({ organizationName, email, recaptchaToken });
  };

  useEffect(() => {
    if (isSuccess || isError) {
      captcha.resetCaptcha();
      if (isSuccess) {
        setEmail("");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isError, isSuccess]);

  const handleOrgNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setOrganizationName(newValue);
    captcha.onOrgNameChange(newValue);
  };

  const handleOrgNameBlur = () => {
    captcha.onOrgNameBlur(organizationName);
  };

  const goToSignIn = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    event.preventDefault();
    navigate("/");
  };

  return (
    <>
      <div className="CardLayout">
        {isSuccess ? (
          <Notification variant="success" title="Password Reset Requested" isFilled={true}>
            {data?.message}
          </Notification>
        ) : null}

        {error ? (
          <Notification variant="error" title="Forgot password error" isFilled={true}>
            <ErrorWithExtras appError={error} />
          </Notification>
        ) : null}

        <form onSubmit={handleForgotPassword}>
          <Heading size="xs" as="h1">
            Forgot password
          </Heading>

          {SINGLE_TENANT_MODE ? null : (
            <Input
              fieldSize="sm"
              id="fp-organization-name"
              name="fp-organization-name"
              label={<InfoTooltip infoText={ORG_NAME_INFO_TEXT}>Organization name</InfoTooltip>}
              onChange={handleOrgNameChange}
              onBlur={handleOrgNameBlur}
              value={organizationName}
              type="text"
            />
          )}
          <Input
            fieldSize="sm"
            id="fp-email"
            name="fp-email"
            label="Email address"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            type="email"
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
            disabled={!organizationName || !email || captcha.isPending}
            isLoading={isPending}
          >
            Submit
          </Button>

          <Link role="button" size="sm" variant="primary" onClick={goToSignIn}>
            Sign in
          </Link>
        </form>
      </div>
    </>
  );
};
