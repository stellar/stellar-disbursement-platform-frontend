import { useMutation, useQueryClient } from "@tanstack/react-query";

import { API_URL } from "@/constants/envVariables";

import { DistributionWallet } from "@/apiQueries/useDistributionWallets";

import { fetchApi } from "@/helpers/fetchApi";

import { AppError } from "@/types";

// Owner-only: archive a distribution (sending) account. Archived accounts accept no new
// disbursements. Their data stays queryable server-side, but the dashboard only keeps them as the
// source-account label on past rows (see SourceAccount) — they are gone from the switcher, the
// balances card and the accounts page. The backend refuses to archive the default account or the
// tenant's last active one. Invalidating by key prefix on success refreshes both the active-only
// and the archived-inclusive wallet lists.
export const useArchiveDistributionWallet = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (walletId: string) => {
      return fetchApi(`${API_URL}/distribution-wallets/${walletId}/archive`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["distribution-wallets"] });
      queryClient.invalidateQueries({ queryKey: ["distribution-wallet-balance"] });
    },
  });

  return {
    ...mutation,
    error: mutation.error as AppError,
    data: mutation.data as DistributionWallet,
  };
};
