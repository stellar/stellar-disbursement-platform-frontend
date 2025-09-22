import { Fragment } from "react";
import { Loader, Notification } from "@stellar/design-system";
import { useAccountBalances } from "@/apiQueries/useAccountBalances";
import { AssetAmount } from "@/components/AssetAmount";
import { ErrorWithExtras } from "@/components/ErrorWithExtras";
import { RPC_URL } from "@/constants/envVariables";
import { InfoTooltip } from "./InfoTooltip";

interface ReceiverWalletBalanceProps {
  stellarAddress: string | undefined;
}

export const ReceiverWalletBalance = ({ stellarAddress }: ReceiverWalletBalanceProps) => {
  const { data: balances, isLoading, isFetching, error } = useAccountBalances(stellarAddress);

  const displayBalances =
    balances?.filter(
      (b) =>
        (b.asset_type == "native" || (b.asset_issuer && b.asset_code)) && parseFloat(b.balance) > 0,
    ) || [];

  if (stellarAddress && (isLoading || isFetching)) {
    return <Loader />;
  }

  if (error) {
    return (
      <Notification variant="error" title="Error" isFilled={true}>
        <ErrorWithExtras appError={error} />
      </Notification>
    );
  }

  if (stellarAddress?.startsWith("C") && !RPC_URL) {
    return (
      <InfoTooltip
        infoText="Fetching balances is disabled. Please check with your technical support team to enable."
        placement="bottom"
      >
        Unavailable
      </InfoTooltip>
    );
  }

  if (displayBalances?.length === 0) {
    return <>{"-"}</>;
  }

  return (
    <>
      {displayBalances?.map((b, index) => (
        <Fragment key={b.asset_type === "native" ? "native" : `${b.asset_code}-${b.asset_issuer}`}>
          <AssetAmount
            assetCode={b.asset_type === "native" ? "XLM" : (b.asset_code ?? "")}
            amount={b.balance}
          />
          {index < displayBalances.length - 1 ? ", " : null}
        </Fragment>
      ))}
    </>
  );
};
