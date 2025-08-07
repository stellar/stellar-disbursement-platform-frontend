import { useEffect, useState } from "react";
import { Button, Heading, Input, Link, Loader, Notification } from "@stellar/design-system";
import { useNavigate, useSearchParams } from "react-router-dom";

import { SINGLE_TENANT_MODE } from "constants/envVariables";
import { ORG_NAME_INFO_TEXT } from "constants/settings";
import { useResetPassword } from "apiQueries/useResetPassword";
import { validateNewPassword } from "helpers/validateNewPassword";
import { validatePasswordMatch } from "helpers/validatePasswordMatch";
import { getSdpTenantName } from "helpers/getSdpTenantName";
import { InfoTooltip } from "components/InfoTooltip";
import { ErrorWithExtras } from "components/ErrorWithExtras";

export const ResetPassword = () => {
  // Get token from URL params
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      setConfirmationToken(token);
    }
  }, [searchParams]);

  const { isSuccess, isPending, error, mutateAsync, reset } = useResetPassword();

  const navigate = useNavigate();

  const [organizationName, setOrganizationName] = useState(getSdpTenantName());
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmationToken, setConfirmationToken] = useState("");

  const [errorPassword, setErrorPassword] = useState("");
  const [errorPasswordMatch, setErrorPasswordMatch] = useState("");

  const handleResetPassword = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutateAsync({ organizationName, password, resetToken: confirmationToken });
  };

  useEffect(() => {
    if (!isSuccess) {
      return;
    }

    setPassword("");
    setConfirmPassword("");
    setConfirmationToken("");

    // Add 3 second delay before redirecting to signin page
    const timer = setTimeout(() => {
      reset();
      navigate("/", { state: { didResetPassword: true } });
    }, 3000);

    return () => clearTimeout(timer);
  }, [isSuccess, navigate, reset]);

  const goToSignIn = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    event.preventDefault();
    reset();
    navigate("/");
  };

  const allInputsValid = () => {
    if (errorPassword || errorPasswordMatch) {
      return false;
    } else if (organizationName && password && confirmPassword && confirmationToken) {
      return true;
    }

    return false;
  };

  return (
    <>
      <div className="CardLayout">
        {isSuccess ? (
          <Notification variant="success" title="Password Reset Successful">
            Your password has been updated. Redirecting to the sign in page{" "}
            <span style={{ verticalAlign: "middle", display: "inline-block" }}>
              <Loader size="1rem" />
            </span>
          </Notification>
        ) : null}

        {error ? (
          <Notification variant="error" title="Reset password error">
            <ErrorWithExtras appError={error} />
          </Notification>
        ) : null}

        <form onSubmit={handleResetPassword}>
          <div className="CardLayout__heading">
            <Heading size="xs" as="h1">
              Reset password
            </Heading>

            <div className="Note">
              New password must be:
              <ul>
                <li>at least 12 characters long,</li>
                <li>a combination of uppercase letters, lowercase letters and numbers</li>
                <li>
                  at least one symbol from: <span className="CodeSnippet">! @ # $ % ^ &amp; *</span>
                </li>
              </ul>
            </div>
          </div>

          {SINGLE_TENANT_MODE ? null : (
            <Input
              fieldSize="sm"
              id="rp-organization-name"
              name="rp-organization-name"
              label={<InfoTooltip infoText={ORG_NAME_INFO_TEXT}>Organization name</InfoTooltip>}
              onChange={(e) => setOrganizationName(e.target.value)}
              value={organizationName}
              type="text"
            />
          )}

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
                setErrorPasswordMatch(validatePasswordMatch(password, confirmPassword));
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
              setErrorPasswordMatch(validatePasswordMatch(password, confirmPassword));
            }}
            value={confirmPassword}
            isPassword
            error={errorPasswordMatch}
          />

          <Button
            variant="primary"
            size="md"
            type="submit"
            disabled={!allInputsValid()}
            isLoading={isPending}
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
