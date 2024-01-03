import { useEffect, useRef, useState } from "react";
import Recaptcha from "react-google-recaptcha";
import {
  Heading,
  Input,
  Button,
  Notification,
  Link,
} from "@stellar/design-system";
import { useNavigate } from "react-router-dom";

import { useForgotPasswordLink } from "apiQueries/useForgotPasswordLink";
import { RECAPTCHA_SITE_KEY } from "constants/settings";
import { ErrorWithExtras } from "components/ErrorWithExtras";

export const ForgotPassword = () => {
  const {
    isSuccess,
    isLoading,
    isError,
    error,
    data,
    mutateAsync: sendLink,
  } = useForgotPasswordLink();

  const navigate = useNavigate();
  const recaptchaRef = useRef<Recaptcha>(null);

  const [email, setEmail] = useState("");
  const [recaptchaToken, setRecaptchaToken] = useState("");

  const handleForgotPassword = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendLink({ email, recaptchaToken });
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

  const goToSignIn = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
  ) => {
    event.preventDefault();
    navigate("/");
  };

  return (
    <>
      <div className="CardLayout">
        {isSuccess ? (
          <Notification variant="success" title="Password reset email sent">
            {data?.message}
          </Notification>
        ) : null}

        {error ? (
          <Notification variant="error" title="Forgot password error">
            <ErrorWithExtras appError={error} />
          </Notification>
        ) : null}

        <form onSubmit={handleForgotPassword}>
          <Heading size="sm" as="h1">
            Forgot password
          </Heading>

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
            size="sm"
            type="submit"
            disabled={!email || !recaptchaToken}
            isLoading={isLoading}
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
