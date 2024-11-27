import { useNavigate } from "react-router-dom";
import { Card, Link, Notification } from "@stellar/design-system";
import { Routes } from "constants/settings";
import { formatDateTime } from "helpers/formatIntlDateTime";
import { renderNumberOrDash } from "helpers/renderNumberOrDash";
import { useSort } from "hooks/useSort";
import { Table } from "components/Table";
import { AssetAmount } from "components/AssetAmount";
import { ErrorWithExtras } from "components/ErrorWithExtras";
import {
  ActionStatus,
  Disbursement,
  DisbursementsSearchParams,
  SortByDisbursements,
  SortDirection,
} from "types";

interface DisbursementsTableProps {
  disbursementItems: Disbursement[];
  searchParams: DisbursementsSearchParams | undefined;
  apiError: string | undefined;
  isFiltersSelected: boolean | undefined;
  status: ActionStatus | undefined;
  onSort?: (sort?: SortByDisbursements, direction?: SortDirection) => void;
}

export const DisbursementsTable: React.FC<DisbursementsTableProps> = ({
  disbursementItems,
  searchParams,
  apiError,
  isFiltersSelected,
  status,
  onSort,
}: DisbursementsTableProps) => {
  const hasSort = Boolean(onSort);
  const { sortBy, sortDir, handleSort } = useSort(onSort);

  const navigate = useNavigate();

  const handleDisbursementClicked = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    disbursement: Disbursement,
  ) => {
    event.preventDefault();

    if (disbursement.status === "DRAFT") {
      navigate(`${Routes.DISBURSEMENT_DRAFTS}/${disbursement.id}`);
    } else {
      navigate(`${Routes.DISBURSEMENTS}/${disbursement.id}`);
    }
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

  if (disbursementItems?.length === 0) {
    if (status === "PENDING") {
      return <div className="Note">Loading…</div>;
    }

    if (searchParams?.q) {
      if (isFiltersSelected) {
        return (
          <div className="Note">
            {`There are no disbursements matching "${searchParams.q}" with selected filters`}
          </div>
        );
      }

      return (
        <div className="Note">
          {`There are no disbursements matching "${searchParams.q}"`}
        </div>
      );
    }

    if (isFiltersSelected) {
      return (
        <div className="Note">
          There are no disbursements matching selected filters
        </div>
      );
    }

    return <div className="Note">There are no disbursements</div>;
  }

  const defaultSortDirection = hasSort ? "default" : undefined;

  return (
    <div className="FiltersWithSearch">
      <Card noPadding>
        <Table>
          <Table.Header>
            {/* TODO: put back once ready */}
            {/* <Table.HeaderCell width="1rem">
            <Checkbox id="disbursements-select-all" fieldSize="xs" />
          </Table.HeaderCell> */}
            <Table.HeaderCell
              sortDirection={sortBy === "name" ? sortDir : defaultSortDirection}
              onSort={() => handleSort("name")}
            >
              Disbursement name
            </Table.HeaderCell>
            <Table.HeaderCell>Total payments</Table.HeaderCell>
            <Table.HeaderCell>Successful</Table.HeaderCell>
            <Table.HeaderCell>Failed</Table.HeaderCell>
            <Table.HeaderCell>Canceled</Table.HeaderCell>
            <Table.HeaderCell>Remaining</Table.HeaderCell>
            <Table.HeaderCell
              sortDirection={
                sortBy === "created_at" ? sortDir : defaultSortDirection
              }
              onSort={() => handleSort("created_at")}
            >
              Created at
            </Table.HeaderCell>
            <Table.HeaderCell>Status</Table.HeaderCell>
            <Table.HeaderCell textAlign="right" width="7.9rem">
              Total amount
            </Table.HeaderCell>
            <Table.HeaderCell textAlign="right" width="7.9rem">
              Amount disbursed
            </Table.HeaderCell>
          </Table.Header>

          <Table.Body>
            {disbursementItems.map((d) => (
              <Table.BodyRow key={d.id}>
                {/* TODO: put back once ready */}
                {/* <Table.BodyCell width="1rem">
                <Checkbox id={`disbursement-${d.id}`} fieldSize="xs" />
              </Table.BodyCell> */}
                <Table.BodyCell title={d.name} width="7.25rem">
                  <Link
                    onClick={(event) => handleDisbursementClicked(event, d)}
                  >
                    {d.name}
                  </Link>
                </Table.BodyCell>
                <Table.BodyCell width="5.5rem" textAlign="right">
                  {renderNumberOrDash(d.stats?.paymentsTotalCount)}
                </Table.BodyCell>
                <Table.BodyCell width="4rem" textAlign="right">
                  {renderNumberOrDash(d.stats?.paymentsSuccessfulCount)}
                </Table.BodyCell>
                <Table.BodyCell width="2.25rem" textAlign="right">
                  {renderNumberOrDash(d.stats?.paymentsFailedCount)}
                </Table.BodyCell>
                <Table.BodyCell width="3.4rem" textAlign="right">
                  {renderNumberOrDash(d.stats?.paymentsCanceledCount)}
                </Table.BodyCell>
                <Table.BodyCell width="3.75rem" textAlign="right">
                  {renderNumberOrDash(d.stats?.paymentsRemainingCount)}
                </Table.BodyCell>
                <Table.BodyCell width="9.375rem">
                  <span className="Table-v2__cell--secondary">
                    {formatDateTime(d.createdAt)}
                  </span>
                </Table.BodyCell>

                <Table.BodyCell textAlign="right">{d.status}</Table.BodyCell>

                <Table.BodyCell textAlign="right" width="7.9rem">
                  <AssetAmount
                    amount={d.stats?.totalAmount}
                    assetCode={d.asset.code}
                    fallback="-"
                  />
                </Table.BodyCell>
                <Table.BodyCell textAlign="right" width="7.9rem">
                  <AssetAmount
                    amount={d.stats?.disbursedAmount}
                    assetCode={d.asset.code}
                    fallback="-"
                  />
                </Table.BodyCell>
              </Table.BodyRow>
            ))}
          </Table.Body>
        </Table>
      </Card>
    </div>
  );
};
