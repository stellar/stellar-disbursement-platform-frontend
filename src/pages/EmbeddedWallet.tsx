import { Button, Notification } from "@stellar/design-system";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { createEmbeddedWallet, pollWalletStatus } from "@/api/embeddedWallet";
import { authenticatePasskey } from "@/api/passkeyAuthentication";
import { registerPasskey } from "@/api/passkeyRegistration";
import { ApiError } from "@/types";

export const EmbeddedWallet = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState("");
  const [isLoadingSignup, setIsLoadingSignup] = useState(false);
  const [isLoadingLogin, setIsLoadingLogin] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tokenFromUrl = searchParams.get("token");
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }
  }, [location]);

  const handleLogin = async () => {
    setIsLoadingLogin(true);
    setErrorMessage("");

    try {
      const { contract_address, credential_id } = await authenticatePasskey();

      navigate("/wallet/home", {
        state: { contract_address, credential_id },
      });
    } catch (error) {
      const apiError = error as ApiError;
      setErrorMessage(apiError?.error || "Authentication failed");
    } finally {
      setIsLoadingLogin(false);
    }
  };

  const handleSignup = async () => {
    if (!token.trim()) {
      setErrorMessage("No wallet token provided");
      return;
    }

    setIsLoadingSignup(true);
    setErrorMessage("");

    try {
      const { credential_id, public_key } = await registerPasskey(token);

      await createEmbeddedWallet({
        token,
        public_key,
        credential_id,
      });

      await pollWalletStatus(credential_id);
      handleLogin();
    } catch (error) {
      const apiError = error as ApiError;
      setErrorMessage(apiError?.error || "Failed to create wallet");
    } finally {
      setIsLoadingSignup(false);
    }
  };

  const isLoading = isLoadingSignup || isLoadingLogin;

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
              isLoading={isLoadingSignup}
            >
              Create Wallet
            </Button>

            <Button
              variant="secondary"
              size="lg"
              onClick={handleLogin}
              disabled={isLoading}
              isLoading={isLoadingLogin}
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
