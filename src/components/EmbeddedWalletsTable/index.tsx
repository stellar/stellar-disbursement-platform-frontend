import { Card } from "@stellar/design-system";
import { Table } from "components/Table";
import { CopyWithIcon } from "components/CopyWithIcon";
import { formatDateTime } from "helpers/formatIntlDateTime";
import { EmbeddedWallet } from "types";
import "../PaymentStatus/styles.scss";

interface EmbeddedWalletsTableProps {
  embeddedWallets: EmbeddedWallet[];
}

const EmbeddedWalletStatus = ({ status }: { status: string }) => {
  switch (status.toUpperCase()) {
    case "SUCCESS":
      return (
        <span className="PaymentStatus PaymentStatus--accent">Success</span>
      );
    case "FAILED":
      return <span className="PaymentStatus">Failed</span>;
    case "PROCESSING":
      return <span className="PaymentStatus">Processing</span>;
    case "PENDING":
    default:
      return <span className="PaymentStatus">Pending</span>;
  }
};

export const EmbeddedWalletsTable: React.FC<EmbeddedWalletsTableProps> = ({
  embeddedWallets,
}) => {
  if (!embeddedWallets || embeddedWallets.length === 0) {
    return <div className="Note">There are no embedded wallets</div>;
  }

  return (
    <div className="FiltersWithSearch">
      <Card noPadding>
        <Table isScrollable={true}>
          <Table.Header>
            <Table.HeaderCell>Token</Table.HeaderCell>
            <Table.HeaderCell width="9.375rem">Created at</Table.HeaderCell>
            <Table.HeaderCell width="9.375rem">Updated at</Table.HeaderCell>
            <Table.HeaderCell textAlign="right" width="6rem">
              Status
            </Table.HeaderCell>
          </Table.Header>

          <Table.Body>
            {embeddedWallets.map((wallet: EmbeddedWallet, index: number) => (
              <Table.BodyRow
                key={`${wallet.token}-${wallet.created_at}-${index}`}
              >
                <Table.BodyCell title={wallet.token}>
                  <CopyWithIcon textToCopy={wallet.token} iconSizeRem="1">
                    <code
                      style={{
                        fontSize: "0.75rem",
                        fontFamily: "var(--font-family-monospace)",
                        wordBreak: "break-all",
                      }}
                    >
                      {wallet.token}
                    </code>
                  </CopyWithIcon>
                </Table.BodyCell>
                <Table.BodyCell>
                  <span className="Table-v2__cell--secondary">
                    {formatDateTime(wallet.created_at)}
                  </span>
                </Table.BodyCell>
                <Table.BodyCell>
                  <span className="Table-v2__cell--secondary">
                    {wallet.updated_at
                      ? formatDateTime(wallet.updated_at)
                      : "—"}
                  </span>
                </Table.BodyCell>
                <Table.BodyCell textAlign="right">
                  <EmbeddedWalletStatus status={wallet.wallet_status} />
                </Table.BodyCell>
              </Table.BodyRow>
            ))}
          </Table.Body>
        </Table>
      </Card>
    </div>
  );
};
