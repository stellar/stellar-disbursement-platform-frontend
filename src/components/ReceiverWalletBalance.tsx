import { Loader, Notification } from "@stellar/design-system";
import { Fragment } from "react";

import { InfoTooltip } from "./InfoTooltip";

import { useStellarAccountInfo } from "@/apiQueries/useStellarAccountInfo";
import { AssetAmount } from "@/components/AssetAmount";
import { ErrorWithExtras } from "@/components/ErrorWithExtras";
import { isContractAddress } from "@/helpers/walletValidate";


interface ReceiverWalletBalanceProps {
  stellarAddress: string | undefined;
}

export const ReceiverWalletBalance = ({ stellarAddress }: ReceiverWalletBalanceProps) => {
  const { isLoading, isFetching, data, error } = useStellarAccountInfo(stellarAddress);

  if (stellarAddress && isContractAddress(stellarAddress)) {
    return (
      <InfoTooltip
        infoText="Fetching balances is currently unsupported for contract accounts."
        placement="bottom"
      >
        Unavailable
      </InfoTooltip>
    );
  }

  const balances =
    data?.balances.filter((b) => b.asset_type == "native" || (b.asset_issuer && b.asset_code)) ||
    [];

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

  if (balances?.length === 0) {
    return <>{"-"}</>;
  }

  return (
    <>
      {balances?.map((b, index) => (
        <Fragment key={b.asset_type === "native" ? "native" : `${b.asset_code}-${b.asset_issuer}`}>
          <AssetAmount
            assetCode={b.asset_type === "native" ? "XLM" : (b.asset_code ?? "")}
            amount={b.balance}
          />
          {index < balances.length - 1 ? ", " : null}
        </Fragment>
      ))}
    </>
  );
};
