import { useState } from "react";

import { format } from "date-fns";

import { Button, Card, Icon, Input, Notification, Select } from "@stellar/design-system";

import { Box } from "@/components/Box";
import { DistributionAccountLabel } from "@/components/DistributionAccountLabel";
import { ErrorWithExtras } from "@/components/ErrorWithExtras";
import { InfoTooltip } from "@/components/InfoTooltip";

import { DistributionWallet, useDistributionWallets } from "@/apiQueries/useDistributionWallets";
import { useStatementExport } from "@/apiQueries/useStatementExport";

import { getStatementPeriodDates } from "@/helpers/getStatementPeriodDates";

import { useRedux } from "@/hooks/useRedux";
import { useSelectedWallet } from "@/hooks/useSelectedWallet";

import type { StatementPeriod } from "@/types";

import "./styles.scss";

const PERIODS: { key: StatementPeriod; label: string }[] = [
  { key: "this_month", label: "This month" },
  { key: "last_month", label: "Last month" },
  { key: "qtd", label: "QTD" },
  { key: "ytd", label: "YTD" },
];

// Statements read the Stellar ledger for an account the SDP holds. Circle accounts have no
// ledger history, and the shared host account's history is not this tenant's.
const statementUnavailableReason = (wallet: DistributionWallet): string | null => {
  switch (wallet.distribution_account_type) {
    case "DISTRIBUTION_ACCOUNT.STELLAR.DB_VAULT":
      return wallet.distribution_account_address
        ? null
        : "This distribution account has not been provisioned yet.";
    case "DISTRIBUTION_ACCOUNT.STELLAR.ENV":
      return "Statements are not available for tenants on the shared host distribution account.";
    default:
      return "Statements are not available for Circle distribution accounts.";
  }
};

export const WalletStatementCard = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [activePeriod, setActivePeriod] = useState<StatementPeriod | null>(null);

  const { userAccount } = useRedux("userAccount");
  const { selectedWalletId, setSelectedWalletId } = useSelectedWallet();
  // Archived accounts are included: year-end reporting needs closed accounts too.
  const { data: wallets } = useDistributionWallets(userAccount.isAuthenticated, true);
  const activeWallets = wallets?.filter((w) => w.status === "ACTIVE") ?? [];
  const archivedWallets = wallets?.filter((w) => w.status === "ARCHIVED") ?? [];

  // The account comes from the account switcher. The one exception is an archived account, which
  // the switcher never offers: under "All accounts" the card can be pointed at one. That detour is
  // remembered against the switcher value it was taken under, so picking an account in the bar
  // always brings the card back to the bar's choice.
  const [archived, setArchived] = useState<{ underSwitcher: string; walletId: string } | null>(
    null,
  );
  const isArchivedMode = archived?.underSwitcher === selectedWalletId;
  const walletId = isArchivedMode ? archived.walletId : selectedWalletId;
  const wallet = wallets?.find((w) => w.id === walletId);
  const unavailableReason = wallet ? statementUnavailableReason(wallet) : null;

  const today = format(new Date(), "yyyy-MM-dd");
  const isValidRange = Boolean(fromDate && toDate && fromDate <= toDate);

  const { mutateAsync: downloadStatement, isPending, error } = useStatementExport();

  const handlePeriodClick = (key: StatementPeriod) => {
    const dates = getStatementPeriodDates(key);
    setFromDate(dates.fromDate);
    setToDate(dates.toDate);
    setActivePeriod(key);
  };

  const handleFromDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFromDate(e.target.value);
    setActivePeriod(null);
  };

  const handleToDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setToDate(e.target.value);
    setActivePeriod(null);
  };

  const handleDownload = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!wallet || unavailableReason || !isValidRange) return;
    downloadStatement({ walletId: wallet.id, fromDate, toDate });
  };

  return (
    <Card>
      <div className="CardStack__card WalletStatementCard">
        <div className="CardStack__title">
          <InfoTooltip infoText="Download a ledger-style PDF for one distribution account over a date range">
            Wallet Statement
          </InfoTooltip>
        </div>

        <div className="WalletStatementCard__account">
          {isArchivedMode ? (
            <>
              <div className="WalletStatementCard__accountHeader">
                <span className="Label Label--sm">Archived distribution account</span>
                <Button size="sm" variant="tertiary" onClick={() => setArchived(null)}>
                  Back to selected account
                </Button>
              </div>
              <Select
                id="statement_archived_account"
                fieldSize="sm"
                value={archived.walletId}
                onChange={(e) =>
                  setArchived({ underSwitcher: selectedWalletId, walletId: e.target.value })
                }
              >
                <option value="">Select an archived account</option>
                {archivedWallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </Select>
            </>
          ) : (
            <>
              <div className="WalletStatementCard__accountHeader">
                <span className="Label Label--sm">Distribution account</span>
                {!selectedWalletId && archivedWallets.length > 0 ? (
                  <Button
                    size="sm"
                    variant="tertiary"
                    onClick={() => setArchived({ underSwitcher: selectedWalletId, walletId: "" })}
                  >
                    Show archived accounts
                  </Button>
                ) : null}
              </div>
              {wallet ? (
                <div className="WalletStatementCard__accountName">{wallet.name}</div>
              ) : (
                // "All accounts" is selected: a statement covers one account, so offer them here,
                // the way a new disbursement asks for its funding account.
                <>
                  <div className="Note WalletStatementCard__pickerNote">
                    Select distribution account.
                  </div>
                  <Box gap="md" direction="row" wrap="wrap">
                    {activeWallets.map((w) => (
                      <Button
                        key={w.id}
                        size="md"
                        variant="tertiary"
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedWalletId(w.id);
                        }}
                      >
                        <DistributionAccountLabel wallet={w} defaultMarker="text" />
                      </Button>
                    ))}
                  </Box>
                </>
              )}
            </>
          )}
        </div>

        {unavailableReason ? (
          <Notification variant="warning" title="Statement unavailable">
            {unavailableReason}
          </Notification>
        ) : (
          <>
            <div className="WalletStatementCard__period">
              <span className="Label Label--sm">Period</span>
              <div className="WalletStatementCard__periodButtons">
                {PERIODS.map(({ key, label }) => (
                  <Button
                    key={key}
                    size="sm"
                    variant={activePeriod === key ? "primary" : "tertiary"}
                    onClick={() => handlePeriodClick(key)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="WalletStatementCard__dateRange">
              <div className="WalletStatementCard__dateInput">
                <Input
                  id="statement_from_date"
                  label="From date"
                  fieldSize="sm"
                  type="date"
                  max={today}
                  value={fromDate}
                  onChange={handleFromDateChange}
                />
              </div>
              <div className="WalletStatementCard__dateInput">
                <Input
                  id="statement_to_date"
                  label="To date"
                  fieldSize="sm"
                  type="date"
                  max={today}
                  value={toDate}
                  onChange={handleToDateChange}
                />
              </div>
            </div>

            {error ? (
              <Notification variant="error" title="Error" isFilled={true}>
                <ErrorWithExtras appError={error} />
              </Notification>
            ) : null}

            <div className="WalletStatementCard__actions">
              <Button
                size="md"
                variant="secondary"
                icon={<Icon.Download01 />}
                iconPosition="left"
                onClick={handleDownload}
                disabled={!wallet || !isValidRange}
                isLoading={isPending}
              >
                Download Statement
              </Button>
            </div>
          </>
        )}
      </div>
    </Card>
  );
};
