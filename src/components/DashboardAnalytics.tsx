import { Card, Loader, Notification } from "@stellar/design-system";

import { AssetAmount } from "@/components/AssetAmount";
import { ErrorWithExtras } from "@/components/ErrorWithExtras";
import { InfoTooltip } from "@/components/InfoTooltip";

import { useDistributionWalletBalance } from "@/apiQueries/useDistributionWalletBalance";
import { useStatistics } from "@/apiQueries/useStatistics";

import { percent } from "@/helpers/formatIntlNumber";
import { parseAssetKey } from "@/helpers/parseAssetKey";
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
  const {
    data: walletBalance,
    error: balanceError,
    isLoading: isBalanceLoading,
  } = useDistributionWalletBalance(userAccount.isAuthenticated, effectiveWalletId || null);

  const calculateRate = () => {
    if (!stats) return 0;

    const numerator = stats.paymentsSuccessfulCounts;
    const denominator = stats.paymentsTotalCount - stats.paymentsDraftCount;
    if (!denominator) return 0;
    return Number(numerator / denominator);
  };

  const statsAssets = stats?.assets ?? [];

  // Balance keys carry the issuer (`CODE:ISSUER`) but /statistics only started returning
  // `asset_issuer` recently, so match on the full pair when it is there and fall back to the
  // old code-only match when it is not — otherwise this table would render empty against a
  // backend that hasn't shipped the field yet. Native has no issuer: parseAssetKey resolves
  // the balance side to "native", and an empty/absent issuer on the stats side takes the
  // code-only path, so XLM joins either way.
  const isSameAsset = (
    statsAsset: { assetCode: string; assetIssuer?: string },
    assetCode: string,
    assetIssuer: string,
  ) => {
    if (statsAsset.assetCode !== assetCode) {
      return false;
    }
    return statsAsset.assetIssuer ? statsAsset.assetIssuer === assetIssuer : true;
  };

  // One row per asset from the UNION of the live balance map and the historical stats, zero-filling
  // only the missing side. Driving rows off balances alone dropped "Total disbursed" — a lifetime
  // figure — for any asset whose balance or trustline is gone, and showed nothing at all whenever
  // the balance request was unavailable.
  const balanceRows = Object.entries(walletBalance?.balances ?? {}).map(([assetKey, amount]) => {
    const { code, issuer } = parseAssetKey(assetKey);
    const statsAsset = statsAssets.find((a) => isSameAsset(a, code, issuer));

    return {
      key: assetKey,
      assetCode: code,
      assetIssuer: issuer,
      balance: amount || "0",
      success: statsAsset?.success || "0",
      average: statsAsset?.average || "0",
    };
  });

  const assetRows = [
    ...balanceRows,
    ...statsAssets
      .filter((a) => !balanceRows.some((row) => isSameAsset(a, row.assetCode, row.assetIssuer)))
      .map((a) => ({
        key: a.assetIssuer ? `${a.assetCode}:${a.assetIssuer}` : a.assetCode,
        assetCode: a.assetCode,
        assetIssuer: a.assetIssuer || "native",
        balance: "0",
        success: a.success,
        average: a.average,
      })),
  ];

  // A failed /statistics fetch has nothing left to draw, so it still replaces the whole card.
  // A failed BALANCE fetch is different: everything else here — payment rate, recipients,
  // recipient wallets, total disbursed — comes from /statistics and is still valid, so blanking
  // the dashboard would lose more than it protects. It is scoped to the balance column below.
  // What matters either way is that a broken request never renders as "0", which is
  // indistinguishable from an account that genuinely holds nothing.
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
  if (isLoading || isBalanceLoading) {
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
                    {balanceError ? (
                      <span className="Note" title={balanceError.message}>
                        Unavailable
                      </span>
                    ) : (
                      <AssetAmount amount={row.balance} assetCode={row.assetCode} />
                    )}
                  </div>
                  <div>
                    <AssetAmount amount={row.success} assetCode={row.assetCode} />
                  </div>
                  {showAverageAmount ? (
                    <div>
                      <AssetAmount amount={row.average} assetCode={row.assetCode} />
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
