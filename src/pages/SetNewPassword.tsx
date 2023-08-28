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
import { USE_SSO, LOCAL_STORAGE_SESSION_TOKEN } from "constants/settings";
import { singleUserStore } from "helpers/singleSingOn";

import { AppDispatch, resetStoreAction } from "store";
import { setNewPasswordAction } from "store/ducks/forgotPassword";
import { useRedux } from "hooks/useRedux";

export const SetNewPassword = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  const { forgotPassword } = useRedux("forgotPassword");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [errorPassword, setErrorPassword] = useState("");
  const [errorNewPassword, setErrorNewPassword] = useState("");
  const [errorPasswordMatch, setErrorPasswordMatch] = useState("");

  useEffect(() => {
    if (forgotPassword.status === "SUCCESS") {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    }
  }, [forgotPassword.status]);

  const handleSignOut = () => {
    if (USE_SSO) {
      // reset user store (from session storage)
      singleUserStore().then();
    }
    dispatch(resetStoreAction());
    localStorage.removeItem(LOCAL_STORAGE_SESSION_TOKEN);
  };

  const goToSignIn = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
  ) => {
    event.preventDefault();
    handleSignOut();
    navigate("/");
  };

  const validatePassword = () => {
    setErrorPassword(currentPassword ? "" : "Current password is required");
  };

  const validateNewPassword = () => {
    const passwordStrength = new RegExp(
      "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})",
    );

    let errorMsg = "";

    if (!newPassword) {
      errorMsg = "Password is required";
    } else if (newPassword.length < 8) {
      errorMsg = "Password must be at least 8 characters long";
    } else if (!passwordStrength.test(newPassword)) {
      errorMsg =
        "Password must have at least one uppercase letter, lowercase letter, number, and symbol.";
    }

    setErrorNewPassword(errorMsg);

    if (confirmNewPassword) {
      validatePasswordMatch();
    }
  };

  const validatePasswordMatch = () => {
    if (confirmNewPassword) {
      setErrorPasswordMatch(
        newPassword === confirmNewPassword ? "" : "Passwords don't match",
      );
    } else {
      setErrorPasswordMatch("Confirm password is required");
    }
  };

  const allInputsValid = () => {
    if (errorPassword || errorNewPassword || errorPasswordMatch) {
      return false;
    } else if (currentPassword && newPassword && confirmNewPassword) {
      return true;
    }

    return false;
  };

  const handleResetCurrentPassword = (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    dispatch(
      setNewPasswordAction({
        currentPassword,
        newPassword,
      }),
    );
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
            {forgotPassword.errorString}
            {forgotPassword.errorExtras ? (
              <ul className="ErrorExtras">
                {Object.entries(forgotPassword.errorExtras).map(
                  ([key, value]) => (
                    <li key={key}>{`${key}: ${value}`}</li>
                  ),
                )}
              </ul>
            ) : null}
          </Notification>
        )}

        <form onSubmit={handleResetCurrentPassword}>
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
            onBlur={validateNewPassword}
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
            onBlur={validatePasswordMatch}
            value={confirmNewPassword}
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
        </form>
      </div>
    </>
  );
};
