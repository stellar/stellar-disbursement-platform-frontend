import { useMutation, useQueryClient } from "@tanstack/react-query";

import { API_URL } from "@/constants/envVariables";

import { DistributionWallet } from "@/apiQueries/useDistributionWallets";

import { fetchApi } from "@/helpers/fetchApi";

import { AppError } from "@/types";

type CreateDistributionWalletProps = {
  name: string;
  description?: string;
};

// Owner-only: provision a new distribution (sending) account. The backend creates and funds a
// fresh Stellar account with its own separately-encrypted keys. Refreshes the wallet list +
// balances on success.
export const useCreateDistributionWallet = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ name, description }: CreateDistributionWalletProps) => {
      return fetchApi(`${API_URL}/distribution-wallets`, {
        method: "POST",
        body: JSON.stringify({ name, description }),
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
