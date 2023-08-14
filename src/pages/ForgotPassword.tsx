import { useEffect, useRef, useState } from "react";
import Recaptcha from "react-google-recaptcha";
import {
  Heading,
  Input,
  Button,
  Notification,
  Link,
} from "@stellar/design-system";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { AppDispatch } from "store";
import { sendResetPasswordLinkAction } from "store/ducks/forgotPassword";
import { RECAPTCHA_SITE_KEY } from "constants/settings";
import { useRedux } from "hooks/useRedux";

export const ForgotPassword = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const recaptchaRef = useRef<Recaptcha>(null);

  const { forgotPassword } = useRedux("forgotPassword");
  const [email, setEmail] = useState("");
  const [recaptchaToken, setRecaptchaToken] = useState("");

  const handleForgotPassword = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch(sendResetPasswordLinkAction({ email, recaptchaToken }));
    recaptchaRef.current?.reset();
    setRecaptchaToken("");
  };

  const onRecaptchaSubmit = (token: string | null) => {
    if (token) {
      setRecaptchaToken(token);
    }
  };

  useEffect(() => {
    if (forgotPassword.status === "SUCCESS") {
      setEmail("");
    }
  }, [forgotPassword.status]);

  const goToSignIn = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
  ) => {
    event.preventDefault();
    navigate("/");
  };

  return (
    <>
      <div className="CardLayout">
        {forgotPassword.status === "SUCCESS" && (
          <Notification variant="success" title="Password reset email sent">
            {forgotPassword.response}
          </Notification>
        )}

        {forgotPassword.errorString && (
          <Notification variant="error" title="Forgot password error">
            {forgotPassword.errorString}
          </Notification>
        )}

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
            isLoading={forgotPassword.status === "PENDING"}
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
