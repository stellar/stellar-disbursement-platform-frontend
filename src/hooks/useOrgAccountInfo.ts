import { useEffect, useState } from "react";
import { useStellarAccountInfo } from "apiQueries/useStellarAccountInfo";
import { AccountBalanceItem } from "types";

export const useOrgAccountInfo = (
  distributionAccountPublicKey: string | undefined,
): {
  address: string;
  balances: AccountBalanceItem[];
  fetchAccountBalances: () => void;
  isDone: boolean;
} => {
  const [balances, setBalances] = useState<AccountBalanceItem[]>([]);
  const [isDone, setIsDone] = useState(false);

  const {
    data: accountInfo,
    isSuccess,
    isError,
    refetch,
  } = useStellarAccountInfo(distributionAccountPublicKey);

  useEffect(() => {
    if (isSuccess) {
      const formattedBalances = accountInfo.balances.map((b) => ({
        balance: b.balance,
        assetCode: b.asset_code ?? "XLM",
        assetIssuer: b.asset_issuer ?? "native",
      }));

      setBalances(formattedBalances);
    }

    if (isSuccess || isError) {
      setIsDone(true);
    }
    // Not including accountInfo.balances
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess]);

  return {
    address: accountInfo?.id || "",
    balances,
    fetchAccountBalances: refetch,
    isDone,
  };
};
