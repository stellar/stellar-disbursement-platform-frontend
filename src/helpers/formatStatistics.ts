import { ApiStatistics, HomeStatistics } from "types";

export const formatStatistics = (statistics: ApiStatistics): HomeStatistics => {
  return {
    paymentsSuccessfulCounts: statistics.payment_counters.success,
    paymentsFailedCount: statistics.payment_counters.failed,
    paymentsCanceledCount: statistics.payment_counters.canceled,
    paymentsDraftCount: statistics.payment_counters.draft,
    paymentsRemainingCount: Number(
      statistics.payment_counters.total -
        statistics.payment_counters.success -
        statistics.payment_counters.failed -
        statistics.payment_counters.canceled,
    ),
    paymentsTotalCount: statistics.payment_counters.total,
    walletsTotalCount: statistics.receiver_wallets_counters.total,
    individualsTotalCount: statistics.total_receivers,
    assets: statistics.payment_amounts_by_asset.map((a) => ({
      assetCode: a.asset_code,
      success: a.payment_amounts.success.toString(),
      average: a.payment_amounts.average.toString(),
    })),
  };
};
