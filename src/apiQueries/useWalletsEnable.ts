import { useMutation } from "@tanstack/react-query";

import { API_URL } from "@/constants/envVariables";

import { fetchApi } from "@/helpers/fetchApi";

import { AppError } from "@/types";

type WalletsEnableProps = {
  walletId: string;
  enabled: boolean;
};

export const useWalletsEnable = () => {
  const mutation = useMutation({
    mutationFn: ({ walletId, enabled }: WalletsEnableProps) => {
      return fetchApi(`${API_URL}/wallets/${walletId}`, {
        method: "PATCH",
        body: JSON.stringify({
          enabled,
        }),
      });
    },
  });

  return {
    ...mutation,
    error: mutation.error as AppError,
    data: mutation.data as { message: string },
    mutateAsync: async ({ walletId, enabled }: WalletsEnableProps) => {
      try {
        await mutation.mutateAsync({ walletId, enabled });
      } catch {
        // do nothing
      }
    },
  };
};
