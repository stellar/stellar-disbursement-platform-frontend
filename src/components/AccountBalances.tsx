import { AssetAmount } from "components/AssetAmount";
import { StellarAccountInfo } from "types";

interface AccountBalancesProps {
  accountInfo: StellarAccountInfo | undefined;
}

export const AccountBalances = ({ accountInfo }: AccountBalancesProps) => {
  if (accountInfo?.balances?.length === 0) {
    return <div className="Note">There are no balances on this account</div>;
  }

  return (
    <>
      {accountInfo?.balances.map((b) => (
        <AssetAmount
          key={`${b.assetCode}-${b.assetIssuer}`}
          amount={b.balance}
          assetCode={b.assetCode}
        />
      ))}
    </>
  );
};
