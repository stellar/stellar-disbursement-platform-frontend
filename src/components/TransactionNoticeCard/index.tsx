import { Button, Card, Icon, Notification, Textarea } from "@stellar/design-system";
import { useState } from "react";

import { usePayments } from "@/apiQueries/usePayments";
import {
  INTERNAL_NOTES_MAX_LENGTH,
  useTransactionNoticeExport,
} from "@/apiQueries/useTransactionNoticeExport";
import { EmptyStateMessage } from "@/components/EmptyStateMessage/EmptyStateMessage";
import { ErrorWithExtras } from "@/components/ErrorWithExtras";
import { InfoTooltip } from "@/components/InfoTooltip";
import { SearchInput } from "@/components/SearchInput";
import { Table } from "@/components/Table";
import { formatDateTime } from "@/helpers/formatIntlDateTime";
import { stripProtocolFromBaseUrl } from "@/helpers/stripProtocolFromBaseUrl";
import { useRedux } from "@/hooks/useRedux";
import type { ApiPayment } from "@/types";

import "./styles.scss";

export const TransactionNoticeCard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [internalNotes, setInternalNotes] = useState("");
  const { organization } = useRedux("organization");

  const { data, isFetching } = usePayments(
    searchQuery ? { q: searchQuery, page: "1", page_limit: "20" } : undefined,
    { enabled: !!searchQuery },
  );

  const {
    mutateAsync: exportTransactionNotice,
    isPending: isExportPending,
    error: exportError,
  } = useTransactionNoticeExport();

  const payments = Array.isArray(data?.data) ? data.data : [];
  const hasResults = payments.length > 0;
  const hasSearched = (searchQuery ?? "").length > 0;
  const showEmptyState = hasSearched && !isFetching && !hasResults;
  const showResults = hasSearched && !isFetching && hasResults;

  const getSelectedId = (): string | null => {
    if (!hasResults || payments.length === 0) return null;
    if (selectedPaymentId && payments.some((p) => p.id === selectedPaymentId)) {
      return selectedPaymentId;
    }
    return payments[0].id;
  };
  const selectedId = getSelectedId();

  const handleSearchSubmit = (text: string) => {
    setSearchQuery(text);
  };

  const handleSearchClear = () => {
    setSearchQuery("");
  };

  const handleDownloadNotice = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!selectedId) return;
    const notesTrimmed = internalNotes.trim();
    const internalNotesParam =
      notesTrimmed.length > INTERNAL_NOTES_MAX_LENGTH
        ? notesTrimmed.slice(0, INTERNAL_NOTES_MAX_LENGTH)
        : notesTrimmed || undefined;
    const baseUrl = organization.data.baseUrl
      ? stripProtocolFromBaseUrl(organization.data.baseUrl)
      : undefined;
    exportTransactionNotice({
      paymentId: selectedId,
      internalNotes: internalNotesParam,
      baseUrl,
    });
  };

  return (
    <Card>
      <div className="CardStack__card TransactionNoticeCard">
        <div className="CardStack__title">
          <InfoTooltip infoText="Generate a PDF for one transaction using its reference ID.">
            Individual Transaction Notice
          </InfoTooltip>
        </div>

        <div className="TransactionNoticeCard__search">
          <span className="Label Label--sm">Search by SDP Transaction ID or Payment ID</span>
          <div className="TransactionNoticeCard__searchInput">
            <SearchInput
              id="transaction-notice-search"
              placeholder="e.g., SDP-2026-001-TX or PAY-ABC-12345"
              onSubmit={handleSearchSubmit}
              onClear={handleSearchClear}
              isLoading={isFetching}
            />
          </div>
        </div>

        {hasSearched && (
          <>
            {isFetching && (
              <div className="TransactionNoticeCard__loading">
                <span className="Note">Loading…</span>
              </div>
            )}

            {showEmptyState && (
              <div className="TransactionNoticeCard__empty">
                <EmptyStateMessage
                  icon={<Icon.AlertCircle className="Icon" />}
                  title="No transactions found"
                  description="Try searching using a full or partial SDP Transaction ID or Payment ID."
                />
              </div>
            )}

            {showResults && (
              <>
                <div className="TransactionNoticeCard__table">
                  <Card noPadding>
                    <Table isLoading={false} isScrollable={true}>
                      <Table.Header>
                        <Table.HeaderCell>Transaction ID</Table.HeaderCell>
                        <Table.HeaderCell>Payment ID</Table.HeaderCell>
                        <Table.HeaderCell>Date</Table.HeaderCell>
                        <Table.HeaderCell>Disbursement Name</Table.HeaderCell>
                      </Table.Header>
                      <Table.Body>
                        {(payments || []).map((p: ApiPayment) => (
                          <Table.BodyRow
                            key={p.id}
                            isHighlighted={selectedId === p.id}
                            onClick={() => setSelectedPaymentId(p.id)}
                          >
                            <Table.BodyCell width="5rem" title={p.id}>
                              {p.id}
                            </Table.BodyCell>
                            <Table.BodyCell width="5em">
                              {p.external_payment_id ?? "—"}
                            </Table.BodyCell>
                            <Table.BodyCell width="10rem">
                              {formatDateTime(p.created_at)}
                            </Table.BodyCell>
                            <Table.BodyCell>{p.disbursement?.name ?? "—"}</Table.BodyCell>
                          </Table.BodyRow>
                        ))}
                      </Table.Body>
                    </Table>
                  </Card>
                </div>

                <div className="TransactionNoticeCard__notes">
                  <span className="Label Label--sm">Notes (Optional)</span>
                  <Textarea
                    fieldSize="sm"
                    id="transaction-notice-notes"
                    rows={3}
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    placeholder="Add any additional notes or comments to include in the PDF..."
                    maxLength={INTERNAL_NOTES_MAX_LENGTH}
                  />
                  <span className="Note TransactionNoticeCard__notesHelp">
                    These notes will be included in the generated PDF. Max{" "}
                    {INTERNAL_NOTES_MAX_LENGTH} characters.
                  </span>
                </div>

                {exportError ? (
                  <Notification variant="error" title="Error" isFilled={true}>
                    <ErrorWithExtras appError={exportError} />
                  </Notification>
                ) : null}

                <div className="TransactionNoticeCard__actions">
                  <Button
                    size="md"
                    variant="secondary"
                    icon={<Icon.Download01 />}
                    iconPosition="left"
                    onClick={handleDownloadNotice}
                    disabled={!selectedId || isExportPending}
                    isLoading={isExportPending}
                  >
                    Download Notice
                  </Button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </Card>
  );
};
