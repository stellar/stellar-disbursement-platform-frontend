import { useMemo } from "react";

import { useDistributionWalletBalance } from "@/apiQueries/useDistributionWalletBalance";
import { useDistributionWallets } from "@/apiQueries/useDistributionWallets";

import { parseAssetKey } from "@/helpers/parseAssetKey";

import { useAllBalances } from "@/hooks/useAllBalances";
import { useRedux } from "@/hooks/useRedux";

import { AccountBalanceItem } from "@/types";

// Live balances of the distribution account `walletId` funds from, or undefined while they aren't
// known. On a multi-account tenant that is `walletId`'s own balance; on a single-account tenant, or
// if the account list fails to load, the tenant's default account.
export const useAccountBalances = (walletId?: string): AccountBalanceItem[] | undefined => {
  const { userAccount } = useRedux("userAccount");
  const { data: wallets, isError: isWalletsError } = useDistributionWallets(
    userAccount.isAuthenticated,
  );
  const isMultiWallet = (wallets?.length ?? 0) >= 2;
  const { data: walletBalance } = useDistributionWalletBalance(
    userAccount.isAuthenticated && isMultiWallet && Boolean(walletId),
    walletId || null,
  );
  const { allBalances } = useAllBalances();

  return useMemo(() => {
    // Until the account list arrives it isn't known whose balance applies.
    if (!wallets && !isWalletsError) {
      return undefined;
    }

    if (isMultiWallet && walletId) {
      return walletBalance
        ? Object.entries(walletBalance.balances).map(([assetKey, amount]) => {
            const { code, issuer } = parseAssetKey(assetKey);

            return { balance: amount || "0", assetCode: code, assetIssuer: issuer };
          })
        : undefined;
    }

    return allBalances;
  }, [wallets, isWalletsError, isMultiWallet, walletId, walletBalance, allBalances]);
};
