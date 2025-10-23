import { Navigate, useLocation } from "react-router-dom";

import { useRedux } from "@/hooks/useRedux";
import { Routes } from "@/constants/settings";

type WalletPrivateRouteProps = {
  children: React.ReactElement;
};

export const WalletPrivateRoute = ({ children }: WalletPrivateRouteProps) => {
  const { walletAccount } = useRedux("walletAccount");
  const location = useLocation();

  const isAuthenticated =
    walletAccount.isAuthenticated &&
    Boolean(walletAccount.contractAddress) &&
    !walletAccount.isSessionExpired;

  if (!isAuthenticated) {
    return (
      <Navigate
        to={{
          pathname: Routes.WALLET,
          search: location.search,
        }}
        replace
      />
    );
  }

  return children;
};
