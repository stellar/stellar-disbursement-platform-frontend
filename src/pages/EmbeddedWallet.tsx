import { Button, Notification } from "@stellar/design-system";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useCreateEmbeddedWallet } from "@/apiQueries/useCreateEmbeddedWallet";
import { usePasskeyAuthentication } from "@/apiQueries/usePasskeyAuthentication";
import { usePasskeyRegistration } from "@/apiQueries/usePasskeyRegistration";

export const EmbeddedWallet = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState("");

  const {
    mutateAsync: authenticatePasskey,
    isPending: isAuthenticating,
    isSuccess: isAuthSuccess,
    error: authError,
    data: authData,
    reset: resetAuthError,
  } = usePasskeyAuthentication();

  const {
    mutateAsync: registerPasskey,
    data: registrationData,
    error: registerError,
    reset: resetRegisterError,
  } = usePasskeyRegistration();

  const {
    mutateAsync: createWallet,
    isPending: isCreatingWallet,
    isSuccess: isWalletCreated,
    error: createWalletError,
    reset: resetCreateWalletError,
  } = useCreateEmbeddedWallet();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tokenFromUrl = searchParams.get("token");
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }
  }, [location]);

  const handleLogin = async () => {
    resetAuthError();
    await authenticatePasskey();
  };

  const handleSignup = async () => {
    if (!token.trim()) {
      return;
    }

    resetRegisterError();
    resetCreateWalletError();
    resetAuthError();

    await registerPasskey({ token });
  };

  useEffect(() => {
    if (registrationData && !createWalletError && !isCreatingWallet) {
      createWallet({
        token,
        public_key: registrationData.public_key,
        credential_id: registrationData.credential_id,
      });
    }
  }, [registrationData, createWallet, token, createWalletError, isCreatingWallet]);

  useEffect(() => {
    if (isWalletCreated && !authError && !isAuthenticating) {
      authenticatePasskey();
    }
  }, [isWalletCreated, authenticatePasskey, authError, isAuthenticating]);

  useEffect(() => {
    if (isAuthSuccess && authData) {
      navigate("/wallet/home");
    }
  }, [isAuthSuccess, authData, navigate]);

  const errorMessage =
    authError?.message ||
    registerError?.message ||
    createWalletError?.message ||
    (!token.trim() && "No wallet token provided") ||
    "";

  const isLoading = isAuthenticating || isCreatingWallet;

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
              isLoading={isCreatingWallet}
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
