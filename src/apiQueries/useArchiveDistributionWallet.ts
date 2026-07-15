import { useMutation, useQueryClient } from "@tanstack/react-query";

import { API_URL } from "@/constants/envVariables";

import { DistributionWallet } from "@/apiQueries/useDistributionWallets";

import { fetchApi } from "@/helpers/fetchApi";

import { AppError } from "@/types";

// Owner-only: archive a distribution (sending) account. Archived accounts accept no new
// disbursements but keep their history and balances queryable; the backend refuses to archive
// the default account or the tenant's last active one. Refreshes the wallet list on success
// (archived wallets drop out of GET /distribution-wallets).
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
