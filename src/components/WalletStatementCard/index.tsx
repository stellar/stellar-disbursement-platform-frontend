import { Button, Card, Icon, Input, Notification } from "@stellar/design-system";
import { useState } from "react";

import { useStatementExport } from "@/apiQueries/useStatementExport";
import { ErrorWithExtras } from "@/components/ErrorWithExtras";
import { InfoTooltip } from "@/components/InfoTooltip";
import {
  getThisMonthDates,
  getLastMonthDates,
  getQTDDates,
  getYTDDates,
} from "@/helpers/getStatementPeriodDates";
import { stripProtocolFromBaseUrl } from "@/helpers/stripProtocolFromBaseUrl";
import { useRedux } from "@/hooks/useRedux";
import type { StatementPeriod } from "@/types";

type StatementPeriodKey = Exclude<StatementPeriod, "custom">;

import "./styles.scss";

const PERIODS: { key: StatementPeriodKey; label: string }[] = [
  { key: "this_month", label: "This month" },
  { key: "last_month", label: "Last month" },
  { key: "qtd", label: "QTD" },
  { key: "ytd", label: "YTD" },
];

const PERIOD_GETTERS: Record<StatementPeriodKey, () => { fromDate: string; toDate: string }> = {
  this_month: getThisMonthDates,
  last_month: getLastMonthDates,
  qtd: getQTDDates,
  ytd: getYTDDates,
};

export const WalletStatementCard = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [activePeriod, setActivePeriod] = useState<StatementPeriodKey | null>(null);
  const { organization } = useRedux("organization");

  const isValidRange = fromDate && toDate && fromDate <= toDate;

  const { mutateAsync: downloadStatement, isPending, error } = useStatementExport();

  const handlePeriodClick = (key: StatementPeriodKey) => {
    const { fromDate: f, toDate: t } = PERIOD_GETTERS[key]();
    setFromDate(f);
    setToDate(t);
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
    if (!isValidRange) return;
    const baseUrl = organization.data.baseUrl
      ? stripProtocolFromBaseUrl(organization.data.baseUrl)
      : undefined;
    downloadStatement({ fromDate, toDate, baseUrl });
  };

  return (
    <Card>
      <div className="CardStack__card WalletStatementCard">
        <div className="CardStack__title">
          <InfoTooltip infoText="Download a ledger-style PDF for a selected date range">
            Wallet Statement
          </InfoTooltip>
        </div>

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
            disabled={!isValidRange || isPending}
            isLoading={isPending}
          >
            Download Statement
          </Button>
        </div>
      </div>
    </Card>
  );
};
