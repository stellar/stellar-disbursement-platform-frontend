import { useQuery } from "@tanstack/react-query";

import { API_URL } from "@/constants/envVariables";

import { fetchApi } from "@/helpers/fetchApi";
import { formatStatistics } from "@/helpers/formatStatistics";

import { ApiStatistics, AppError } from "@/types";

export const useStatistics = (isAuthenticated: boolean, selectedWalletId?: string | null) => {
  const query = useQuery<ApiStatistics, AppError>({
    // Key on the selected wallet so switching the picker refetches immediately
    // (fetchApi sends the matching X-Wallet-Id) instead of serving stale cache.
    // `||`, not `??`: the context stores "" (not null) for "All accounts", so the sentinel
    // has to match the one the other wallet-scoped queries use.
    queryKey: ["statistics", selectedWalletId || "all"],
    queryFn: async () => {
      return await fetchApi(`${API_URL}/statistics`, undefined, {
        walletId: selectedWalletId || null,
      });
    },
    enabled: Boolean(isAuthenticated),
  });

  return {
    ...query,
    data: query.data ? formatStatistics(query.data) : undefined,
  };
};
