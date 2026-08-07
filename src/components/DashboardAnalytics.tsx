import { Card, Loader, Notification } from "@stellar/design-system";

import { AssetAmount } from "@/components/AssetAmount";
import { ErrorWithExtras } from "@/components/ErrorWithExtras";
import { InfoTooltip } from "@/components/InfoTooltip";

import { useDistributionWalletBalance } from "@/apiQueries/useDistributionWalletBalance";
import { useStatistics } from "@/apiQueries/useStatistics";

import { percent } from "@/helpers/formatIntlNumber";
import { renderNumberOrDash } from "@/helpers/renderNumberOrDash";

import { useRedux } from "@/hooks/useRedux";
import { useSelectedWallet } from "@/hooks/useSelectedWallet";

type DashboardAnalyticsProps = {
  // Show the lifetime "Average amount" column. On by default (Analytics page); the Home
  // dashboard hides it to keep the headline on live balance + total disbursed.
  showAverageAmount?: boolean;
};

export const DashboardAnalytics = ({ showAverageAmount = true }: DashboardAnalyticsProps) => {
  const { userAccount } = useRedux("userAccount");
  // The active account comes from the global ActiveWalletBar (shared context).
  const { selectedWalletId } = useSelectedWallet();

  const effectiveWalletId = selectedWalletId;

  const {
    data: stats,
    error,
    isLoading,
  } = useStatistics(userAccount.isAuthenticated, effectiveWalletId);
  const { data: walletBalance } = useDistributionWalletBalance(
    userAccount.isAuthenticated,
    effectiveWalletId || null,
  );

  const calculateRate = () => {
    if (!stats) return 0;

    const numerator = stats.paymentsSuccessfulCounts;
    const denominator = stats.paymentsTotalCount - stats.paymentsDraftCount;
    if (!denominator) return 0;
    return Number(numerator / denominator);
  };

  // One row per asset from the UNION of the live balance map and the historical stats, zero-filling
  // only the missing side. Driving rows off balances alone dropped "Total disbursed" — a lifetime
  // figure — for any asset whose balance or trustline is gone, and showed nothing at all whenever
  // the balance request was unavailable.
  const balanceEntries = Object.entries(walletBalance?.balances ?? {});
  const assetRows = [
    ...balanceEntries.map(([assetKey, amount]) => ({
      key: assetKey,
      assetCode: assetKey.split(":")[0],
      balance: amount || "0",
    })),
    ...(stats?.assets ?? [])
      .filter((a) => !balanceEntries.some(([assetKey]) => assetKey.split(":")[0] === a.assetCode))
      .map((a) => ({ key: a.assetCode, assetCode: a.assetCode, balance: "0" })),
  ];

  if (error) {
    return (
      <Notification variant="error" title="Error" isFilled={true}>
        <ErrorWithExtras appError={error} />
      </Notification>
    );
  }

  // Only block on the first load. On an account switch we keep the previous cards visible
  // (react-query serves cached data while refetching) so the dashboard doesn't blank out —
  // this is what made switching "feel slow" before.
  if (isLoading) {
    return (
      <div className="StatCards StatCards--home">
        <Loader size="2rem" />
      </div>
    );
  }

  return (
    <div className="StatCards StatCards--home">
      {/* TODO: add disbursement volume chart */}

      <Card>
        <div className="StatCards__card--split">
          <div>
            <div className="StatCards__card__title">
              <InfoTooltip infoText="The percentage of payments completed successfully (pending payments are not counted as successful)">
                Successful payment rate
              </InfoTooltip>
            </div>
            {/* TODO: add chart */}
            <div className="StatCards__card__unit">{`${percent.format(calculateRate())}`}</div>
          </div>

          <div>
            <div className="StatCards__card__column">
              <div className="StatCards__card__item StatCards__card__item--inline">
                <label className="StatCards__card__item__label">Successful payments</label>
                <div className="StatCards__card__item__value">
                  {renderNumberOrDash(stats?.paymentsSuccessfulCounts)}
                </div>
              </div>

              <div className="StatCards__card__item StatCards__card__item--inline">
                <label className="StatCards__card__item__label">Failed payments</label>
                <div className="StatCards__card__item__value">
                  {renderNumberOrDash(stats?.paymentsFailedCount)}
                </div>
              </div>

              <div className="StatCards__card__item StatCards__card__item--inline">
                <label className="StatCards__card__item__label">Canceled payments</label>
                <div className="StatCards__card__item__value">
                  {renderNumberOrDash(stats?.paymentsCanceledCount)}
                </div>
              </div>

              <div className="StatCards__card__item StatCards__card__item--inline">
                <label className="StatCards__card__item__label">Remaining payments</label>
                <div className="StatCards__card__item__value">
                  {renderNumberOrDash(stats?.paymentsRemainingCount)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="StatCards__card--split">
          <div>
            <div className="StatCards__card--flexCols">
              <div>
                <div className="StatCards__card__title">
                  <InfoTooltip infoText="The live on-chain balance of the distribution account(s) you can access — the active account when one is selected, otherwise all of them combined.">
                    Total balance
                  </InfoTooltip>
                </div>
              </div>

              <div>
                <div className="StatCards__card__title">
                  <InfoTooltip infoText="Lifetime total successfully disbursed (historical). Total balance above is the live day-to-day number.">
                    Total disbursed
                  </InfoTooltip>
                </div>
              </div>

              {showAverageAmount ? (
                <div>
                  <div className="StatCards__card__title">
                    <InfoTooltip infoText="The average individual payment amount for your organization over time.">
                      Average amount
                    </InfoTooltip>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="StatCards__card__assets">
              {assetRows.map((row) => (
                <div className="StatCards__card--flexCols" key={row.key}>
                  <div>
                    <AssetAmount amount={row.balance} assetCode={row.assetCode} />
                  </div>
                  <div>
                    <AssetAmount
                      amount={
                        stats?.assets.find((a) => a.assetCode === row.assetCode)?.success || "0"
                      }
                      assetCode={row.assetCode}
                    />
                  </div>
                  {showAverageAmount ? (
                    <div>
                      <AssetAmount
                        amount={
                          stats?.assets.find((a) => a.assetCode === row.assetCode)?.average || "0"
                        }
                        assetCode={row.assetCode}
                      />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <div className="StatCards__card__column">
            <div className="StatCards__card__item StatCards__card__item--inline">
              <label className="StatCards__card__item__label">
                <InfoTooltip infoText="Unique individuals you've created payments for (your recipients).">
                  Recipients
                </InfoTooltip>
              </label>
              <div className="StatCards__card__item__value">
                {renderNumberOrDash(stats?.individualsTotalCount)}
              </div>
            </div>

            <div className="StatCards__card__item StatCards__card__item--inline">
              <label className="StatCards__card__item__label">
                <InfoTooltip infoText="Wallets your recipients receive funds into — not your distribution (sending) wallets.">
                  Recipient wallets
                </InfoTooltip>
              </label>
              <div className="StatCards__card__item__value">
                {renderNumberOrDash(stats?.walletsTotalCount)}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
