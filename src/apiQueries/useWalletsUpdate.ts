import { useMutation } from "@tanstack/react-query";

import { API_URL } from "@/constants/envVariables";

import { fetchApi } from "@/helpers/fetchApi";

import { ApiAddWalletRequest, ApiWallet, AppError } from "@/types";

type WalletsUpdateProps = {
  walletId: string;
  request: ApiAddWalletRequest;
};

export const useWalletsUpdate = () => {
  const mutation = useMutation({
    mutationFn: ({ walletId, request }: WalletsUpdateProps) => {
      return fetchApi(`${API_URL}/wallets/${walletId}`, {
        method: "PATCH",
        body: JSON.stringify(request),
      });
    },
  });

  return {
    ...mutation,
    error: mutation.error as AppError,
    data: mutation.data as ApiWallet,
    mutateAsync: async ({ walletId, request }: WalletsUpdateProps) => {
      try {
        await mutation.mutateAsync({ walletId, request });
      } catch {
        // do nothing
      }
    },
  };
};
