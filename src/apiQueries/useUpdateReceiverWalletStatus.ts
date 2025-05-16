import { useMutation } from "@tanstack/react-query";
import { API_URL } from "constants/envVariables";
import { fetchApi } from "helpers/fetchApi";
import { AppError } from "types";

type UpdateReceiverWalletStatusParams = {
  receiverWalletId: string;
  status: string;
};

export const useUpdateReceiverWalletStatus = () => {
  const mutation = useMutation({
    mutationFn: ({
      receiverWalletId,
      status,
    }: UpdateReceiverWalletStatusParams) => {
      return fetchApi(
        `${API_URL}/receivers/wallets/${receiverWalletId}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status }),
        },
      );
    },
  });

  return {
    ...mutation,
    error: mutation.error as AppError,
    data: mutation.data as { message: string },
    mutateAsync: async ({
      receiverWalletId,
      status,
    }: UpdateReceiverWalletStatusParams) => {
      try {
        await mutation.mutateAsync({ receiverWalletId, status });
      } catch {
        // do nothing
      }
    },
  };
};
