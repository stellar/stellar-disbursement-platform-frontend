import { Button } from "@stellar/design-system";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { useWalletBalance } from "@/apiQueries/useWalletBalance";
import { localStorageWalletSessionToken } from "@/helpers/localStorageWalletSessionToken";
import { useRedux } from "@/hooks/useRedux";
import { AppDispatch } from "@/store";
import { clearWalletInfoAction } from "@/store/ducks/walletAccount";

export const EmbeddedWalletHome = () => {
  const { walletAccount } = useRedux("walletAccount");
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  const contractAddress = walletAccount.contractAddress;

  const { data: balanceData, isLoading: isLoadingBalance } = useWalletBalance(contractAddress);

  const handleLogout = () => {
    localStorageWalletSessionToken.remove();
    dispatch(clearWalletInfoAction());
    navigate("/wallet", { replace: true });
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
            <div style={{ textAlign: "center" }}>
              {isLoadingBalance ? (
                <div
                  style={{
                    fontSize: "2rem",
                    fontWeight: "bold",
                  }}
                >
                  Loading...
                </div>
              ) : (
                <div style={{ fontSize: "2.5rem", fontWeight: "bold" }}>
                  {balanceData?.balance || "0"} {balanceData?.asset_code || "XLM"}
                </div>
              )}
            </div>

            <div
              style={{
                fontSize: "0.875rem",
                wordBreak: "break-all",
                textAlign: "center",
              }}
            >
              {contractAddress}
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
