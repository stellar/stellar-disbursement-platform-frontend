import { Fragment, useEffect } from "react";
import { Notification } from "@stellar/design-system";
import { useQuery } from "@tanstack/react-query";
import { getStellarAccountInfo } from "api/getStellarAccountInfo";
import { AssetAmount } from "components/AssetAmount";

interface ReceiverWalletBalanceProps {
  stellarAddress: string | undefined;
}

export const ReceiverWalletBalance = ({
  stellarAddress,
}: ReceiverWalletBalanceProps) => {
  const getBalance = async () => {
    if (!stellarAddress) {
      return [];
    }

    const response = await getStellarAccountInfo(stellarAddress);
    // We don't want to show XLM (native) balance
    return response.balances.filter((b) => b.asset_issuer && b.asset_code);
  };

  const { isLoading, data, isError, error, refetch } = useQuery({
    queryKey: ["ReceiverWalletBalance"],
    queryFn: getBalance,
  });

  useEffect(() => {
    refetch();
  }, [stellarAddress, refetch]);

  if (isLoading) {
    return <div className="Note">Loading…</div>;
  }

  if (isError) {
    return (
      <Notification variant="error" title="Error">
        {error as string}
      </Notification>
    );
  }

  if (data?.length === 0) {
    return <>{"-"}</>;
  }

  return (
    <>
      {data?.map((b, index) => (
        <Fragment key={`${b.asset_code}-${b.asset_issuer}`}>
          <AssetAmount assetCode={b.asset_code ?? ""} amount={b.balance} />
          {index < data.length - 1 ? ", " : null}
        </Fragment>
      ))}
    </>
  );
};
