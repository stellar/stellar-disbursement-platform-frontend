import { useEffect, useState } from "react";
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
import {
  resetForgotPasswordAction,
  resetPasswordAction,
} from "store/ducks/forgotPassword";
import { useRedux } from "hooks/useRedux";
import { validateNewPassword } from "helpers/validateNewPassword";
import { validatePasswordMatch } from "helpers/validatePasswordMatch";

export const ResetPassword = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  const { forgotPassword } = useRedux("forgotPassword");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmationToken, setConfirmationToken] = useState("");

  const [errorPassword, setErrorPassword] = useState("");
  const [errorPasswordMatch, setErrorPasswordMatch] = useState("");
  const [errorConfirmationToken, setErrorConfirmationToken] = useState("");

  const handleResetPassword = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch(resetPasswordAction({ password, confirmationToken }));
  };

  useEffect(() => {
    if (forgotPassword.status === "SUCCESS") {
      setPassword("");
      setConfirmPassword("");
      setConfirmationToken("");
    }
  }, [forgotPassword.status]);

  const goToSignIn = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
  ) => {
    event.preventDefault();
    dispatch(resetForgotPasswordAction());
    navigate("/");
  };

  const validateConfirmationToken = () => {
    setErrorConfirmationToken(
      confirmationToken ? "" : "Confirmation token is required",
    );
  };

  const allInputsValid = () => {
    if (errorPassword || errorPasswordMatch || errorConfirmationToken) {
      return false;
    } else if (password && confirmPassword && confirmationToken) {
      return true;
    }

    return false;
  };

  return (
    <>
      <div className="CardLayout">
        {forgotPassword.status === "SUCCESS" && (
          <Notification variant="success" title="Password reset">
            Password reset successfully. You can{" "}
            <Link onClick={goToSignIn}>sign in</Link> using your new password.
          </Notification>
        )}

        {forgotPassword.errorString && (
          <Notification variant="error" title="Reset password error">
            {forgotPassword.errorString}. Check your email for the correct
            token.
          </Notification>
        )}

        <form onSubmit={handleResetPassword}>
          <div className="CardLayout__heading">
            <Heading size="sm" as="h1">
              Reset password
            </Heading>

            <div className="Note">
              New password must be:
              <ul>
                <li>at least 8 characters long,</li>
                <li>
                  a combination of uppercase letters, lowercase letters,
                  numbers, and symbols.
                </li>
              </ul>
            </div>
          </div>

          <Input
            fieldSize="sm"
            id="rp-token"
            name="rp-token"
            label="Confirmation token"
            onChange={(e) => {
              setErrorConfirmationToken("");
              setConfirmationToken(e.target.value);
            }}
            onBlur={validateConfirmationToken}
            value={confirmationToken}
            error={errorConfirmationToken}
          />

          <Input
            fieldSize="sm"
            id="rp-password"
            name="rp-password"
            label="New password"
            onChange={(e) => {
              setErrorPassword("");
              setPassword(e.target.value);
            }}
            onBlur={() => {
              setErrorPassword(validateNewPassword(password));

              if (confirmPassword) {
                setErrorPasswordMatch(
                  validatePasswordMatch(password, confirmPassword),
                );
              }
            }}
            value={password}
            isPassword
            error={errorPassword}
          />

          <Input
            fieldSize="sm"
            id="rp-confirm-password"
            name="rp-confirm-password"
            label="Confirm new password"
            onChange={(e) => {
              setErrorPasswordMatch("");
              setConfirmPassword(e.target.value);
            }}
            onBlur={() => {
              setErrorPasswordMatch(
                validatePasswordMatch(password, confirmPassword),
              );
            }}
            value={confirmPassword}
            isPassword
            error={errorPasswordMatch}
          />

          <Button
            variant="primary"
            size="sm"
            type="submit"
            disabled={!allInputsValid()}
            isLoading={forgotPassword.status === "PENDING"}
          >
            Reset password
          </Button>

          <Link role="button" size="sm" variant="primary" onClick={goToSignIn}>
            Sign in
          </Link>
        </form>
      </div>
    </>
  );
};
