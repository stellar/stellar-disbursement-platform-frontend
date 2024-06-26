import { AssetAmount } from "components/AssetAmount";
import { AccountBalanceItem } from "types";

interface AccountBalancesProps {
  accountBalances: AccountBalanceItem[] | undefined;
}

export const AccountBalances = ({ accountBalances }: AccountBalancesProps) => {
  if (!accountBalances || accountBalances?.length === 0) {
    return <div className="Note">There are no balances on this account</div>;
  }

  return (
    <>
      {accountBalances.map((b) => (
        <AssetAmount
          key={`${b.assetCode}-${b.assetIssuer}`}
          amount={b.balance}
          assetCode={b.assetCode}
        />
      ))}
    </>
  );
};
