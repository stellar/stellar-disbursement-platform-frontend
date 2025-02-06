import { Card, Link, Notification } from "@stellar/design-system";
import { formatDateTime } from "helpers/formatIntlDateTime";
import {
  getReceiverContactInfoTitle,
  renderReceiverContactInfoItems,
} from "helpers/receiverContactInfo";
import { useSort } from "hooks/useSort";
import { MultipleAmounts } from "components/MultipleAmounts";
import { Table } from "components/Table";
import { ErrorWithExtras } from "components/ErrorWithExtras";
import { Receiver, SortByReceivers, SortDirection } from "types";

interface ReceiversTableProps {
  receiversItems: Receiver[];
  onReceiverClicked: (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    id: string,
  ) => void;
  searchQuery: string | undefined;
  apiError: string | undefined;
  isFiltersSelected: boolean | undefined;
  isLoading?: boolean;
  onSort?: (sort?: SortByReceivers, direction?: SortDirection) => void;
}

export const ReceiversTable: React.FC<ReceiversTableProps> = ({
  receiversItems,
  onReceiverClicked,
  searchQuery,
  apiError,
  isFiltersSelected,
  isLoading,
  onSort,
}: ReceiversTableProps) => {
  const { sortBy, sortDir, handleSort } = useSort(onSort);

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

  if (receiversItems?.length === 0) {
    if (isLoading) {
      return <div className="Note">Loading…</div>;
    }

    if (searchQuery) {
      if (isFiltersSelected) {
        return (
          <div className="Note">
            {`There are no receivers matching "${searchQuery}" with selected filters`}
          </div>
        );
      }

      return (
        <div className="Note">
          {`There are no receivers matching "${searchQuery}"`}
        </div>
      );
    }

    if (isFiltersSelected) {
      return (
        <div className="Note">
          There are no receivers matching selected filters
        </div>
      );
    }

    return <div className="Note">There are no receivers</div>;
  }

  return (
    <div className="FiltersWithSearch">
      <Card noPadding>
        <Table isLoading={isLoading} isScrollable={true}>
          <Table.Header>
            {/* TODO: put back once ready */}
            {/* <Table.HeaderCell width="1rem">
            <Checkbox id="receivers-select-all" fieldSize="xs" />
          </Table.HeaderCell> */}
            <Table.HeaderCell>Contact info</Table.HeaderCell>
            <Table.HeaderCell width="12rem">
              Wallet provider(s)
            </Table.HeaderCell>
            <Table.HeaderCell textAlign="right">
              Wallets registered
            </Table.HeaderCell>
            <Table.HeaderCell textAlign="right">
              Total payments
            </Table.HeaderCell>
            <Table.HeaderCell textAlign="right">Successful</Table.HeaderCell>
            <Table.HeaderCell
              width="10rem"
              sortDirection={sortBy === "created_at" ? sortDir : "default"}
              onSort={() => handleSort("created_at")}
            >
              Created at
            </Table.HeaderCell>
            <Table.HeaderCell textAlign="right">
              Amount(s) received
            </Table.HeaderCell>
          </Table.Header>

          <Table.Body>
            {receiversItems.map((d) => (
              <Table.BodyRow key={d.id}>
                {/* TODO: put back once ready */}
                {/* <Table.BodyCell width="1rem">
                <Checkbox id={`receiver-${d.id}`} fieldSize="xs" />
              </Table.BodyCell> */}
                <Table.BodyCell
                  title={getReceiverContactInfoTitle(d.phoneNumber, d.email)}
                  wrap={true}
                >
                  <Link onClick={(event) => onReceiverClicked(event, d.id)}>
                    {renderReceiverContactInfoItems(d.phoneNumber, d.email)}
                  </Link>
                </Table.BodyCell>
                <Table.BodyCell
                  width="12rem"
                  title={d.walletProvider.join(", ")}
                >
                  {d.walletProvider.join(", ")}
                </Table.BodyCell>
                <Table.BodyCell textAlign="right">
                  {d.walletsRegisteredCount || "-"}
                </Table.BodyCell>
                <Table.BodyCell textAlign="right">
                  {d.totalPaymentsCount}
                </Table.BodyCell>
                <Table.BodyCell textAlign="right">
                  {d.successfulPaymentsCounts}
                </Table.BodyCell>
                <Table.BodyCell width="10rem">
                  <span className="Table-v2__cell--secondary">
                    {d.createdAt ? formatDateTime(d.createdAt) : "-"}
                  </span>
                </Table.BodyCell>
                <Table.BodyCell textAlign="right">
                  <MultipleAmounts amounts={d.amountsReceived} />
                </Table.BodyCell>
              </Table.BodyRow>
            ))}
          </Table.Body>
        </Table>
      </Card>
    </div>
  );
};
