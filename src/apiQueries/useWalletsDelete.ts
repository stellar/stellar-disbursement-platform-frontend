import { useMutation } from "@tanstack/react-query";

import { API_URL } from "@/constants/envVariables";

import { fetchApi } from "@/helpers/fetchApi";

import { AppError } from "@/types";

type WalletsDeleteProps = {
  walletId: string;
};

export const useWalletsDelete = () => {
  const mutation = useMutation({
    mutationFn: async ({ walletId }: WalletsDeleteProps) => {
      await fetchApi(`${API_URL}/wallets/${walletId}`, { method: "DELETE" });

      // fetchApi resolves null on the 204, so return the message to keep `data`'s shape.
      return { message: "Wallet deleted successfully" };
    },
  });

  return {
    ...mutation,
    error: mutation.error as AppError,
    data: mutation.data as { message: string },
    mutateAsync: async ({ walletId }: WalletsDeleteProps) => {
      try {
        await mutation.mutateAsync({ walletId });
      } catch {
        // do nothing
      }
    },
  };
};
