import { Button } from "@stellar/design-system";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { useWalletBalance } from "@/apiQueries/useWalletBalance";
import { localStorageWalletSessionToken } from "@/helpers/localStorageWalletSessionToken";
import { useRedux } from "@/hooks/useRedux";
import { AppDispatch } from "@/store";
import { clearWalletInfoAction } from "@/store/ducks/walletAccount";
import { Routes } from "@/constants/settings";

export const EmbeddedWalletHome = () => {
  const { walletAccount } = useRedux("walletAccount");
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  const contractAddress = walletAccount.contractAddress;

  const { data: balanceData, isLoading: isLoadingBalance } = useWalletBalance(contractAddress);

  const handleLogout = () => {
    localStorageWalletSessionToken.remove();
    dispatch(clearWalletInfoAction());
    navigate(Routes.WALLET, { replace: true });
  };

  return (
    <div className="SignIn">
      <div className="SignIn__container">
        <div className="SignIn__content">
          {isLoadingBalance ? (
            <strong>Loading...</strong>
          ) : (
            <strong>
              {balanceData?.balance || "0"} {balanceData?.asset_code || "XLM"}
            </strong>
          )}

          <p>{contractAddress}</p>

          <Button variant="secondary" size="lg" onClick={handleLogout}>
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};
