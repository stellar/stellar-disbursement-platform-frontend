import { useMemo } from "react";

import { useStellarAccountInfo } from "@/apiQueries/useStellarAccountInfo";

import { AccountBalanceItem } from "@/types";

export const useOrgAccountInfo = (
  distributionAccountPublicKey: string | undefined,
): {
  address: string;
  balances: AccountBalanceItem[];
  fetchAccountBalances: () => void;
  isDone: boolean;
} => {
  const {
    data: accountInfo,
    isSuccess,
    isError,
    refetch,
  } = useStellarAccountInfo(distributionAccountPublicKey);

  const balances = useMemo<AccountBalanceItem[]>(
    () =>
      (accountInfo?.balances ?? []).map((b) => ({
        balance: b.balance,
        assetCode: b.asset_code ?? "XLM",
        assetIssuer: b.asset_issuer ?? "native",
      })),
    [accountInfo],
  );

  return {
    address: accountInfo?.id || "",
    balances,
    fetchAccountBalances: refetch,
    isDone: isSuccess || isError,
  };
};
