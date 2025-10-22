import { Button, Notification } from "@stellar/design-system";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

import { useCreateEmbeddedWallet } from "@/apiQueries/useCreateEmbeddedWallet";
import { usePasskeyAuthentication } from "@/apiQueries/usePasskeyAuthentication";
import { usePasskeyRefresh } from "@/apiQueries/usePasskeyRefresh";
import { usePasskeyRegistration } from "@/apiQueries/usePasskeyRegistration";
import { useRedux } from "@/hooks/useRedux";
import { AppDispatch } from "@/store";
import { setWalletTokenAction } from "@/store/ducks/walletAccount";

export const EmbeddedWallet = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { walletAccount } = useRedux("walletAccount");
  const [token, setToken] = useState("");

  const {
    mutateAsync: authenticatePasskey,
    isPending: isAuthenticating,
    error: authError,
    reset: resetAuthError,
  } = usePasskeyAuthentication();

  const {
    mutateAsync: registerPasskey,
    isPending: isRegistering,
    error: registerError,
    reset: resetRegisterError,
  } = usePasskeyRegistration();

  const {
    mutateAsync: createWallet,
    isPending: isCreatingWallet,
    error: createWalletError,
    reset: resetCreateWalletError,
  } = useCreateEmbeddedWallet();

  const {
    mutateAsync: refreshToken,
    isPending: isRefreshing,
    error: refreshError,
    reset: resetRefreshError,
  } = usePasskeyRefresh();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tokenFromUrl = searchParams.get("token");
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }
  }, [location]);

  useEffect(() => {
    if (
      walletAccount.isAuthenticated &&
      walletAccount.contractAddress &&
      !walletAccount.isSessionExpired
    ) {
      navigate("/wallet/home", { replace: true });
    }
  }, [
    navigate,
    walletAccount.isAuthenticated,
    walletAccount.contractAddress,
    walletAccount.isSessionExpired,
  ]);

  const handleLogin = async () => {
    resetAuthError();
    resetRefreshError();
    resetRegisterError();
    resetCreateWalletError();

    try {
      const result = await authenticatePasskey();
      dispatch(setWalletTokenAction(result.token));
      navigate("/wallet/home");
    } catch {
      // mutation handles error state
    }
  };

  const handleSignup = async () => {
    if (!token.trim()) {
      return;
    }

    resetRegisterError();
    resetCreateWalletError();
    resetAuthError();
    resetRefreshError();

    try {
      const registration = await registerPasskey({ token });

      await createWallet({
        token,
        public_key: registration.public_key,
        credential_id: registration.credential_id,
      });

      const refreshed = await refreshToken({ token: registration.token });

      dispatch(setWalletTokenAction(refreshed.token));
      navigate("/wallet/home");
    } catch {
      // mutation handles error state
    }
  };

  const errorMessage =
    authError?.message ||
    registerError?.message ||
    createWalletError?.message ||
    refreshError?.message ||
    "";

  const isSignupProcessing = isRegistering || isCreatingWallet || isRefreshing;
  const isLoading = isAuthenticating || isSignupProcessing;

  return (
    <div className="SignIn">
      <div className="SignIn__container">
        <div className="SignIn__content">
          {errorMessage && <Notification variant="error" title={errorMessage} />}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              maxWidth: "300px",
              margin: "0 auto",
            }}
          >
            <Button
              variant="primary"
              size="lg"
              onClick={handleSignup}
              disabled={isLoading || !token.trim()}
              isLoading={isSignupProcessing}
            >
              Create Wallet
            </Button>

            <Button
              variant="secondary"
              size="lg"
              onClick={handleLogin}
              disabled={isLoading}
              isLoading={isAuthenticating}
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
