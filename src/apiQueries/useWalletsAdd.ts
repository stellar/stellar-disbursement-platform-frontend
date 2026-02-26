import { useMutation } from "@tanstack/react-query";

import { API_URL } from "@/constants/envVariables";

import { fetchApi } from "@/helpers/fetchApi";

import { ApiWalletRequest, ApiAddWalletResponse, AppError } from "@/types";

export const useWalletsAdd = ({
  onSuccess,
}: {
  onSuccess?: (addedWallet: ApiAddWalletResponse) => void;
} = {}) => {
  const mutation = useMutation({
    mutationFn: async (request: ApiWalletRequest) => {
      return fetchApi(`${API_URL}/wallets`, {
        method: "POST",
        body: JSON.stringify(request),
      });
    },
    onSuccess,
  });

  return {
    ...mutation,
    error: mutation.error as AppError,
    data: mutation.data as ApiAddWalletResponse,
    mutateAsync: async (request: ApiWalletRequest) => {
      try {
        await mutation.mutateAsync(request);
      } catch {
        // do nothing
      }
    },
  };
};
