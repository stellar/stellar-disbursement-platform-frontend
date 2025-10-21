import { Button } from "@stellar/design-system";
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface WalletHomeState {
  contract_address: string;
  credential_id: string;
}

export const EmbeddedWalletHome = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { contract_address } = (location.state as WalletHomeState | undefined) || {};

  useEffect(() => {
    if (!contract_address) {
      navigate("/wallet");
    }
  }, [contract_address, navigate]);

  const handleLogout = () => {
    navigate("/wallet", { replace: true, state: null });
  };

  return (
    <div className="SignIn">
      <div className="SignIn__container">
        <div className="SignIn__content">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              maxWidth: "300px",
              margin: "0 auto",
            }}
          >
            <div style={{ fontSize: "0.875rem", wordBreak: "break-all", textAlign: "center" }}>
              {contract_address}
            </div>

            <Button variant="secondary" size="lg" onClick={handleLogout}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
