import { useMemo } from "react";

import { useDistributionWalletBalance } from "@/apiQueries/useDistributionWalletBalance";

import { parseAssetKey } from "@/helpers/parseAssetKey";

import { useAllBalances } from "@/hooks/useAllBalances";
import { useRedux } from "@/hooks/useRedux";

import { AccountBalanceItem } from "@/types";

// Live balances of the distribution account `walletId`, or undefined while they aren't known.
// Without a `walletId`, the tenant's default account.
export const useAccountBalances = (walletId?: string): AccountBalanceItem[] | undefined => {
  const { userAccount } = useRedux("userAccount");
  const { data: walletBalance } = useDistributionWalletBalance(
    userAccount.isAuthenticated && Boolean(walletId),
    walletId || null,
  );
  const { allBalances } = useAllBalances();

  return useMemo(() => {
    if (!walletId) {
      return allBalances;
    }

    return walletBalance
      ? Object.entries(walletBalance.balances).map(([assetKey, amount]) => {
          const { code, issuer } = parseAssetKey(assetKey);

          return { balance: amount || "0", assetCode: code, assetIssuer: issuer };
        })
      : undefined;
  }, [walletId, walletBalance, allBalances]);
};
