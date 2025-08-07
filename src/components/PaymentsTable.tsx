import { useNavigate } from "react-router-dom";
import { Link, Profile, Notification, Card } from "@stellar/design-system";
import { Routes } from "constants/settings";

import { AssetAmount } from "components/AssetAmount";
import { PaymentStatus } from "components/PaymentStatus";
import { Table } from "components/Table";
import { ErrorWithExtras } from "components/ErrorWithExtras";
import { formatDateTime } from "helpers/formatIntlDateTime";
import { ApiPayment } from "types";

interface PaymentsTableProps {
  paymentItems: ApiPayment[];
  apiError: string | undefined;
  isFiltersSelected: boolean | undefined;
  isLoading: boolean;
}

export const PaymentsTable = ({
  paymentItems,
  apiError,
  isFiltersSelected,
  isLoading,
}: PaymentsTableProps) => {
  const navigate = useNavigate();

  const handlePaymentClicked = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    paymentId: string,
  ) => {
    event.preventDefault();
    navigate(`${Routes.PAYMENTS}/${paymentId}`);
  };

  const handlePaymentDisbursementClicked = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    disbursementId: string,
  ) => {
    event.preventDefault();
    navigate(`${Routes.DISBURSEMENTS}/${disbursementId}`);
  };

  if (apiError) {
    return (
      <Notification variant="error" title="Error">
        <ErrorWithExtras
          appError={{
            message: apiError,
          }}
        />
      </Notification>
    );
  }

  if (paymentItems?.length === 0) {
    if (isLoading) {
      return <div className="Note">Loading…</div>;
    }

    if (isFiltersSelected) {
      return <div className="Note">There are no payments matching your selected filters</div>;
    }

    return <div className="Note">There are no payments</div>;
  }

  return (
    <div className="FiltersWithSearch">
      <Card noPadding>
        <Table isLoading={isLoading} isScrollable={true}>
          <Table.Header>
            {/* TODO: put back once ready */}
            {/* <Table.HeaderCell>
            <Checkbox id="payments-select-all" fieldSize="xs" />
          </Table.HeaderCell> */}
            <Table.HeaderCell>Payment ID</Table.HeaderCell>
            <Table.HeaderCell>Wallet address</Table.HeaderCell>
            <Table.HeaderCell>Disbursement name</Table.HeaderCell>
            <Table.HeaderCell width="9.375rem">Completed at</Table.HeaderCell>
            <Table.HeaderCell textAlign="right" width="8.125rem">
              Amount
            </Table.HeaderCell>
            <Table.HeaderCell textAlign="right" width="4rem">
              Status
            </Table.HeaderCell>
            <Table.HeaderCell>Type</Table.HeaderCell>
          </Table.Header>

          <Table.Body>
            {paymentItems.map((p, index) => (
              // Using index here to make sure UI works if we have duplicate entries
              // Otherwise, table data is not updating
              <Table.BodyRow key={`${p.id}-${p.created_at}-${index}`}>
                {/* TODO: put back once ready */}
                {/* <Table.BodyCell width="1rem">
                <Checkbox id={`payment-${p.id}`} fieldSize="xs" />
              </Table.BodyCell> */}
                <Table.BodyCell width="14rem" title={p.id}>
                  <Link onClick={(event) => handlePaymentClicked(event, p.id)}>
                    <span className="PaymentIDs__item">{p.id}</span>
                    {p.external_payment_id ? (
                      <span className="PaymentIDs__item">{p.external_payment_id}</span>
                    ) : null}
                  </Link>
                </Table.BodyCell>
                <Table.BodyCell width="7.5rem" allowOverflow>
                  {p.receiver_wallet?.stellar_address ? (
                    <Profile
                      publicAddress={p.receiver_wallet?.stellar_address}
                      size="md"
                      isCopy
                      isShort
                      hideAvatar
                    />
                  ) : (
                    "-"
                  )}
                </Table.BodyCell>
                <Table.BodyCell width="7.5rem" title={p.disbursement?.name || "-"}>
                  {(() => {
                    const disbursement = p.disbursement;
                    return disbursement ? (
                      <Link
                        onClick={(event) =>
                          handlePaymentDisbursementClicked(event, disbursement.id)
                        }
                      >
                        {disbursement.name}
                      </Link>
                    ) : (
                      "-"
                    );
                  })()}
                </Table.BodyCell>
                <Table.BodyCell>
                  <span className="Table-v2__cell--secondary">
                    {p.status === "SUCCESS" ? formatDateTime(p.updated_at) : "-"}
                  </span>
                </Table.BodyCell>
                <Table.BodyCell textAlign="right">
                  <AssetAmount amount={p.amount} assetCode={p.asset.code} fallback="-" />
                </Table.BodyCell>
                <Table.BodyCell textAlign="right">
                  <PaymentStatus status={p.status} />
                </Table.BodyCell>
                <Table.BodyCell>
                  <span className="Table-v2__cell--secondary">{p.type}</span>
                </Table.BodyCell>
              </Table.BodyRow>
            ))}
          </Table.Body>
        </Table>
      </Card>
    </div>
  );
};
