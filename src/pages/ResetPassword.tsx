import { useEffect, useState } from "react";
import {
  Heading,
  Input,
  Button,
  Notification,
  Link,
} from "@stellar/design-system";
import { useNavigate } from "react-router-dom";

import { useResetPassword } from "apiQueries/useResetPassword";
import { validateNewPassword } from "helpers/validateNewPassword";
import { validatePasswordMatch } from "helpers/validatePasswordMatch";
import { getOrganizationName } from "helpers/getOrganizationName";
import { InfoTooltip } from "components/InfoTooltip";

export const ResetPassword = () => {
  const { isSuccess, isLoading, error, mutateAsync, reset } =
    useResetPassword();

  const navigate = useNavigate();

  const [organizationName, setOrganizationName] = useState(
    getOrganizationName(),
  );
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmationToken, setConfirmationToken] = useState("");

  const [errorPassword, setErrorPassword] = useState("");
  const [errorPasswordMatch, setErrorPasswordMatch] = useState("");
  const [errorConfirmationToken, setErrorConfirmationToken] = useState("");

  const handleResetPassword = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutateAsync({ organizationName, password, resetToken: confirmationToken });
  };

  useEffect(() => {
    if (isSuccess) {
      setPassword("");
      setConfirmPassword("");
      setConfirmationToken("");
    }
  }, [isSuccess]);

  const goToSignIn = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
  ) => {
    event.preventDefault();
    reset();
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
    } else if (
      organizationName &&
      password &&
      confirmPassword &&
      confirmationToken
    ) {
      return true;
    }

    return false;
  };

  return (
    <>
      <div className="CardLayout">
        {isSuccess ? (
          <Notification variant="success" title="Password reset">
            Password reset successfully. You can{" "}
            <Link onClick={goToSignIn}>sign in</Link> using your new password.
          </Notification>
        ) : null}

        {error ? (
          <Notification variant="error" title="Reset password error">
            {error.message}
            {error?.extras ? (
              <ul className="ErrorExtras">
                {Object.entries(error?.extras).map(([key, value]) => (
                  <li key={key}>{`${key}: ${value}`}</li>
                ))}
              </ul>
            ) : null}
          </Notification>
        ) : null}

        <form onSubmit={handleResetPassword}>
          <div className="CardLayout__heading">
            <Heading size="sm" as="h1">
              Reset password
            </Heading>

            <div className="Note">
              New password must be:
              <ul>
                <li>at least 12 characters long,</li>
                <li>
                  a combination of uppercase letters, lowercase letters,
                  numbers, and symbols.
                </li>
              </ul>
            </div>
          </div>

          <Input
            fieldSize="sm"
            id="rp-organization-name"
            name="rp-organization-name"
            label={
              <InfoTooltip infoText="You can find your organization name in the invitation email">
                Organization name
              </InfoTooltip>
            }
            onChange={(e) => setOrganizationName(e.target.value)}
            value={organizationName}
            type="text"
          />

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
            isLoading={isLoading}
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
