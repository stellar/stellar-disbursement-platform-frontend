import { Card, Link, Profile, Notification } from "@stellar/design-system";
import { STELLAR_EXPERT_URL } from "constants/envVariables";
import { useStellarAccountPayments } from "apiQueries/useStellarAccountPayments";
import { formatDateTime } from "helpers/formatIntlDateTime";

import { Table } from "components/Table";
import { AssetAmount } from "components/AssetAmount";
import { ErrorWithExtras } from "components/ErrorWithExtras";

interface ReceiverWalletHistoryProps {
  stellarAddress: string | undefined;
}

export const ReceiverWalletHistory = ({ stellarAddress }: ReceiverWalletHistoryProps) => {
  const { isLoading, isFetching, data, error } = useStellarAccountPayments(stellarAddress);

  if (stellarAddress && (isLoading || isFetching)) {
    return <div className="Note">Loading…</div>;
  }

  if (error) {
    return (
      <Notification variant="error" title="Error">
        <ErrorWithExtras appError={error} />
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
                  <Link href={`${STELLAR_EXPERT_URL}/tx/${p.transactionHash}`}>{p.id}</Link>
                </Table.BodyCell>
                <Table.BodyCell>
                  <span className="Table-v2__cell--secondary">{formatDateTime(p.createdAt)}</span>
                </Table.BodyCell>
                <Table.BodyCell>
                  {p.paymentAddress ? (
                    <Profile size="md" publicAddress={p.paymentAddress} isCopy isShort hideAvatar />
                  ) : (
                    "-"
                  )}
                </Table.BodyCell>
                <Table.BodyCell>
                  {p.memo ? <span className="Table-v2__cell--secondary">{p.memo}</span> : null}
                </Table.BodyCell>
                <Table.BodyCell textAlign="right">
                  {p.operationKind === "send" ? "-" : "+"}
                  <AssetAmount amount={p.amount} assetCode={p.assetCode} fallback="-" />
                </Table.BodyCell>
              </Table.BodyRow>
            ))
          ) : (
            <Table.BodyRow>
              <td colSpan={5} className="ReceiverDetails__wallets__noRecentPayments">
                No recent payments
              </td>
            </Table.BodyRow>
          )}
        </Table.Body>
      </Table>
    </Card>
  );
};
