import { useQuery } from "@tanstack/react-query";

import { API_URL } from "@/constants/envVariables";

import { fetchApi } from "@/helpers/fetchApi";

import { AppError } from "@/types";

export type DistributionWalletBalance = {
  wallet_id?: string;
  balances: Record<string, string>;
};

// Live on-chain balances of the tenant's DISTRIBUTION wallet(s) — the sending accounts, not
// recipient wallets. Per-wallet when a wallet is selected; the Owner-only all-wallets
// aggregate otherwise. Backs the dashboard Total Balance tile.
export const useDistributionWalletBalance = (
  isAuthenticated: boolean,
  selectedWalletId: string | null,
) => {
  return useQuery<DistributionWalletBalance, AppError>({
    queryKey: ["distribution-wallet-balance", selectedWalletId ?? "all"],
    queryFn: async () => {
      const path = selectedWalletId
        ? `${API_URL}/distribution-wallets/${selectedWalletId}/balance`
        : `${API_URL}/distribution-wallets/balance`;
      return await fetchApi(path);
    },
    enabled: Boolean(isAuthenticated),
  });
};
