import { useEffect } from "react";
import { Card, Link, Profile, Notification } from "@stellar/design-system";
import { useQuery } from "@tanstack/react-query";

import { getStellarAccountPayments } from "api/getStellarAccountPayments";
import { getStellarTransaction } from "api/getStellarTransaction";
import { STELLAR_EXPERT_URL } from "constants/settings";
import { formatDateTime } from "helpers/formatIntlDateTime";

import { Table } from "components/Table";
import { AssetAmount } from "components/AssetAmount";

import { ApiStellarOperationRecord, ReceiverWalletPayment } from "types";

interface ReceiverWalletHistoryProps {
  stellarAddress: string | undefined;
}

const formatWalletPayment = async (
  payment: ApiStellarOperationRecord,
  walletAddress: string,
): Promise<ReceiverWalletPayment> => {
  const isSend = payment.from === walletAddress;

  // Getting transaction details to get the memo
  const transaction = await getStellarTransaction(payment.transaction_hash);

  return {
    id: payment.id.toString(),
    amount: payment.amount,
    paymentAddress: isSend ? payment.to : payment.from,
    createdAt: payment.created_at,
    assetCode: payment.asset_code,
    assetIssuer: payment.asset_issuer,
    operationKind: isSend ? "send" : "receive",
    transactionHash: payment.transaction_hash,
    memo: transaction.memo || "",
  };
};

export const ReceiverWalletHistory = ({
  stellarAddress,
}: ReceiverWalletHistoryProps) => {
  const getPayments = async () => {
    if (!stellarAddress) {
      return [];
    }

    // We don't want to show XLM (native) payments
    const response = (await getStellarAccountPayments(stellarAddress)).filter(
      (r) => r.asset_issuer && r.asset_code,
    );
    const payments = [];

    for await (const record of response) {
      const payment = await formatWalletPayment(record, stellarAddress);
      payments.push(payment);
    }

    return payments;
  };

  const { isLoading, isError, data, error, refetch } = useQuery({
    queryKey: ["ReceiverWalletHistory"],
    queryFn: getPayments,
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

  return (
    <Card noPadding>
      <Table>
        <Table.Header>
          <Table.HeaderCell>Operation ID</Table.HeaderCell>
          <Table.HeaderCell>Date/time</Table.HeaderCell>
          <Table.HeaderCell>Wallet address</Table.HeaderCell>
          <Table.HeaderCell>Memo</Table.HeaderCell>
          <Table.HeaderCell textAlign="right">Amount</Table.HeaderCell>
        </Table.Header>

        <Table.Body>
          {data && data.length > 0 ? (
            data.map((p) => (
              <Table.BodyRow key={p.id}>
                <Table.BodyCell>
                  <Link href={`${STELLAR_EXPERT_URL}/tx/${p.transactionHash}`}>
                    {p.id}
                  </Link>
                </Table.BodyCell>
                <Table.BodyCell>
                  <span className="Table-v2__cell--secondary">
                    {formatDateTime(p.createdAt)}
                  </span>
                </Table.BodyCell>
                <Table.BodyCell>
                  {p.paymentAddress ? (
                    <Profile
                      size="sm"
                      publicAddress={p.paymentAddress}
                      isCopy
                      isShort
                      hideAvatar
                    />
                  ) : (
                    "-"
                  )}
                </Table.BodyCell>
                <Table.BodyCell>
                  {p.memo ? (
                    <span className="Table-v2__cell--secondary">{p.memo}</span>
                  ) : null}
                </Table.BodyCell>
                <Table.BodyCell textAlign="right">
                  {p.operationKind === "send" ? "-" : "+"}
                  <AssetAmount
                    amount={p.amount}
                    assetCode={p.assetCode}
                    fallback="-"
                  />
                </Table.BodyCell>
              </Table.BodyRow>
            ))
          ) : (
            <Table.BodyRow>
              <td
                colSpan={5}
                className="ReceiverDetails__wallets__noRecentPayments"
              >
                No recent payments
              </td>
            </Table.BodyRow>
          )}
        </Table.Body>
      </Table>
    </Card>
  );
};
