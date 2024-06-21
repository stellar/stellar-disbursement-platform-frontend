import { useEffect, useState } from "react";
import { useCircleAccount } from "hooks/useCircleAccount";
import { useRedux } from "hooks/useRedux";
import { useOrgAccountInfo } from "hooks/useOrgAccountInfo";
import { useCircleBalances } from "apiQueries/useCircleBalances";
import { StellarAccountBalance } from "types";

export const useAllBalances = () => {
  const { organization } = useRedux("organization");
  const { isCircleAccount, isCircleAccountActive, walletId } =
    useCircleAccount();

  const { data: circleBalances, isSuccess: isCircleBalancesSuccess } =
    useCircleBalances(
      Boolean(isCircleAccount && isCircleAccountActive && walletId),
    );
  const { isDone, balances: stellarBalances } = useOrgAccountInfo(
    organization.data?.distributionAccountPublicKey,
  );

  const [allBalances, setAllBalances] = useState<
    StellarAccountBalance[] | undefined
  >(undefined);

  useEffect(() => {
    if (isCircleAccount && isCircleAccountActive && isCircleBalancesSuccess) {
      const formattedCircleBalances = circleBalances?.balances.map((b) => ({
        balance: b.amount,
        assetCode: b.asset_code,
        assetIssuer: b.asset_issuer,
      }));
      setAllBalances(formattedCircleBalances);
    }
    // Not including circleBalances.balances
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCircleAccount, isCircleAccountActive, isCircleBalancesSuccess]);

  useEffect(() => {
    if (isDone) {
      setAllBalances(stellarBalances);
    }
    // Not including stellarBalances
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDone]);

  return { allBalances };
};
