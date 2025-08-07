import { useEffect, useRef, useState } from "react";
import Recaptcha from "react-google-recaptcha";
import { Heading, Input, Button, Notification, Link } from "@stellar/design-system";
import { useNavigate } from "react-router-dom";

import { useForgotPasswordLink } from "apiQueries/useForgotPasswordLink";
import { ORG_NAME_INFO_TEXT } from "constants/settings";
import { RECAPTCHA_SITE_KEY, SINGLE_TENANT_MODE } from "constants/envVariables";
import { ErrorWithExtras } from "components/ErrorWithExtras";
import { InfoTooltip } from "components/InfoTooltip";
import { getSdpTenantName } from "helpers/getSdpTenantName";

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

  const [organizationName, setOrganizationName] = useState(getSdpTenantName());
  const [email, setEmail] = useState("");
  const [recaptchaToken, setRecaptchaToken] = useState("");

  const handleForgotPassword = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendLink({ organizationName, email, recaptchaToken });
  };

  const onRecaptchaSubmit = (token: string | null) => {
    if (token) {
      setRecaptchaToken(token);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      setEmail("");
      setRecaptchaToken("");
      recaptchaRef.current?.reset();
    }

    if (isError) {
      setRecaptchaToken("");
      recaptchaRef.current?.reset();
    }
  }, [isError, isSuccess]);

  const goToSignIn = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    event.preventDefault();
    navigate("/");
  };

  return (
    <>
      <div className="CardLayout">
        {isSuccess ? (
          <Notification variant="success" title="Password Reset Requested">
            {data?.message}
          </Notification>
        ) : null}

        {error ? (
          <Notification variant="error" title="Forgot password error">
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
              onChange={(e) => setOrganizationName(e.target.value)}
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
            disabled={!organizationName || !email || !recaptchaToken}
            isLoading={isPending}
            data-callback="onRecaptchaSubmit"
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
