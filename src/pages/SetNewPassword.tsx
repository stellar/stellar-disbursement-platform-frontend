import { useEffect, useState } from "react";
import { Heading, Input, Button, Notification, Link } from "@stellar/design-system";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { USE_SSO } from "constants/envVariables";
import { singleUserStore } from "helpers/singleSingOn";
import { validateNewPassword } from "helpers/validateNewPassword";
import { validatePasswordMatch } from "helpers/validatePasswordMatch";
import { localStorageSessionToken } from "helpers/localStorageSessionToken";

import { useNewPassword } from "apiQueries/useNewPassword";
import { AppDispatch, resetStoreAction } from "store";
import { ErrorWithExtras } from "components/ErrorWithExtras";

export const SetNewPassword = () => {
  const { isSuccess, isPending, error, mutateAsync: submitNewPassword } = useNewPassword();

  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [errorPassword, setErrorPassword] = useState("");
  const [errorNewPassword, setErrorNewPassword] = useState("");
  const [errorPasswordMatch, setErrorPasswordMatch] = useState("");

  useEffect(() => {
    if (isSuccess) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");

      if (USE_SSO) {
        // reset user store (from session storage)
        singleUserStore();
      }
      dispatch(resetStoreAction());
      localStorageSessionToken.remove();
    }
  }, [dispatch, isSuccess]);

  const goToSignIn = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    event.preventDefault();
    navigate("/");
  };

  const validatePassword = () => {
    setErrorPassword(currentPassword ? "" : "Current password is required");
  };

  const allInputsValid = () => {
    if (errorPassword || errorNewPassword || errorPasswordMatch) {
      return false;
    } else if (currentPassword && newPassword && confirmNewPassword) {
      return true;
    }

    return false;
  };

  const handleResetCurrentPassword = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitNewPassword({ currentPassword, newPassword });
  };

  return (
    <>
      <div className="CardLayout">
        {isSuccess ? (
          <Notification variant="success" title="Password reset">
            Password reset successfully. You can <Link onClick={goToSignIn}>sign in</Link> using
            your new password.
          </Notification>
        ) : null}

        {error ? (
          <Notification variant="error" title="Reset password error">
            <ErrorWithExtras appError={error} />
          </Notification>
        ) : null}

        <form onSubmit={handleResetCurrentPassword}>
          <div className="CardLayout__heading">
            <Heading size="sm" as="h1">
              Reset password
            </Heading>

            <div className="Note">
              New password must be:
              <ul>
                <li>at least 12 characters long,</li>
                <li>
                  a combination of uppercase letters, lowercase letters, numbers, and symbols.
                </li>
              </ul>
            </div>
          </div>

          <Input
            fieldSize="sm"
            id="rp-password"
            name="rp-password"
            label="Current password"
            onChange={(e) => {
              setErrorPassword("");
              setCurrentPassword(e.target.value);
            }}
            onBlur={validatePassword}
            value={currentPassword}
            isPassword
            error={errorPassword}
          />

          <Input
            fieldSize="sm"
            id="rp-new-password"
            name="rp-new-password"
            label="New password"
            onChange={(e) => {
              setErrorNewPassword("");
              setNewPassword(e.target.value);
            }}
            onBlur={() => {
              setErrorNewPassword(validateNewPassword(newPassword));

              if (confirmNewPassword) {
                setErrorPasswordMatch(validatePasswordMatch(newPassword, confirmNewPassword));
              }
            }}
            value={newPassword}
            isPassword
            error={errorNewPassword}
          />

          <Input
            fieldSize="sm"
            id="rp-confirm-new-password"
            name="rp-confirm-new-password"
            label="Confirm new password"
            onChange={(e) => {
              setErrorPasswordMatch("");
              setConfirmNewPassword(e.target.value);
            }}
            onBlur={() => {
              setErrorPasswordMatch(validatePasswordMatch(newPassword, confirmNewPassword));
            }}
            value={confirmNewPassword}
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
        </form>
      </div>
    </>
  );
};
