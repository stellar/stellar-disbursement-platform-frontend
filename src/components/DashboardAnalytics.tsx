import { Card, Notification } from "@stellar/design-system";

import { AssetAmount } from "@/components/AssetAmount";
import { ErrorWithExtras } from "@/components/ErrorWithExtras";
import { InfoTooltip } from "@/components/InfoTooltip";

import { useDistributionWalletBalance } from "@/apiQueries/useDistributionWalletBalance";
import { useStatistics } from "@/apiQueries/useStatistics";

import { percent } from "@/helpers/formatIntlNumber";
import { localStorageSelectedWallet } from "@/helpers/localStorageSelectedWallet";
import { renderNumberOrDash } from "@/helpers/renderNumberOrDash";

import { useRedux } from "@/hooks/useRedux";

type DashboardAnalyticsProps = {
  // The picker's selection ("" = All wallets). Drives the query keys so the cards
  // refetch immediately on change. Optional: callers without a picker (e.g. Analytics)
  // fall back to the persisted selection.
  selectedWalletId?: string;
};

export const DashboardAnalytics = ({ selectedWalletId }: DashboardAnalyticsProps) => {
  const { userAccount } = useRedux("userAccount");

  const effectiveWalletId = selectedWalletId ?? localStorageSelectedWallet.get() ?? "";

  const {
    data: stats,
    error,
    isLoading,
    isFetching,
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

  if (error) {
    return (
      <Notification variant="error" title="Error" isFilled={true}>
        <ErrorWithExtras appError={error} />
      </Notification>
    );
  }

  if (isLoading || isFetching) {
    return (
      <div className="StatCards StatCards--home">
        <div className="Note">Loading…</div>
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
                  <InfoTooltip infoText="The live on-chain balance of the selected distribution wallet (all wallets when none is selected)">
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

              <div>
                <div className="StatCards__card__title">
                  <InfoTooltip infoText="The average individual payment amount for your organization over time.">
                    Average amount
                  </InfoTooltip>
                </div>
              </div>
            </div>

            <div className="StatCards__card__assets">
              {Object.entries(walletBalance?.balances ?? {}).map(([assetKey, amount]) => (
                <div className="StatCards__card--flexCols" key={assetKey}>
                  <div>
                    <AssetAmount amount={amount || "0"} assetCode={assetKey.split(":")[0]} />
                  </div>
                  <div>
                    <AssetAmount
                      amount={
                        stats?.assets.find((a) => a.assetCode === assetKey.split(":")[0])
                          ?.success || "0"
                      }
                      assetCode={assetKey.split(":")[0]}
                    />
                  </div>
                  <div>
                    <AssetAmount
                      amount={
                        stats?.assets.find((a) => a.assetCode === assetKey.split(":")[0])
                          ?.average || "0"
                      }
                      assetCode={assetKey.split(":")[0]}
                    />
                  </div>
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
