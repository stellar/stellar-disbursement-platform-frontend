import { useMutation } from "@tanstack/react-query";

import { createEmbeddedWallet, pollWalletStatus } from "@/api/embeddedWallet";
import type { CreateWalletRequest, WalletResponse } from "@/api/embeddedWallet";
import type { AppError } from "@/types";

export const useCreateEmbeddedWallet = () => {
  const mutation = useMutation({
    mutationFn: async (request: CreateWalletRequest) => {
      await createEmbeddedWallet(request);
      const result = await pollWalletStatus(request.credential_id);

      return result;
    },
  });

  return {
    ...mutation,
    error: mutation.error as AppError,
    data: mutation.data as WalletResponse,
    mutateAsync: async (request: CreateWalletRequest) => {
      try {
        await mutation.mutateAsync(request);
      } catch {
        // do nothing
      }
    },
  };
};
