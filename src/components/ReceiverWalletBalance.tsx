import { Fragment } from "react";
import { Loader, Notification } from "@stellar/design-system";
import { useStellarAccountInfo } from "apiQueries/useStellarAccountInfo";
import { AssetAmount } from "components/AssetAmount";
import { ErrorWithExtras } from "components/ErrorWithExtras";

interface ReceiverWalletBalanceProps {
  stellarAddress: string | undefined;
}

export const ReceiverWalletBalance = ({
  stellarAddress,
}: ReceiverWalletBalanceProps) => {
  const { isLoading, isFetching, data, error } =
    useStellarAccountInfo(stellarAddress);

  const balances =
    data?.balances.filter((b) => b.asset_type == "native" || b.asset_issuer && b.asset_code) || [];

  if (stellarAddress && (isLoading || isFetching)) {
    return <Loader />;
  }

  if (error) {
    return (
      <Notification variant="error" title="Error">
        <ErrorWithExtras appError={error} />
      </Notification>
    );
  }

  if (balances?.length === 0) {
    return <>{"-"}</>;
  }

  return (
    <>
      {balances?.map((b, index) => (
        <Fragment key={b.asset_type === "native" ? "native" : `${b.asset_code}-${b.asset_issuer}`}>
        <AssetAmount
          assetCode={b.asset_type === "native" ? "XLM" : b.asset_code ?? ""}
          amount={b.balance}
        />
        {index < balances.length - 1 ? ", " : null}
      </Fragment>
      ))}
    </>
  );
};
