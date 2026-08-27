import { useMutation } from "@tanstack/react-query";

import { API_URL } from "@/constants/envVariables";

import { fetchApi } from "@/helpers/fetchApi";

import { ApiReceiver, AppError, CreateReceiverRequest } from "@/types";

export const useCreateReceiver = ({
  onSuccess,
  selectedWalletId,
}: {
  onSuccess: (receiver: ApiReceiver) => void;
  selectedWalletId?: string | null;
}) => {
  const mutation = useMutation({
    mutationFn: (receiverData: CreateReceiverRequest) => {
      // The receiver is stamped with the account it was created under, so the write has to name one.
      // With "all accounts" selected there is nothing to stamp and the backend answers 400.
      return fetchApi(
        `${API_URL}/receivers`,
        {
          method: "POST",
          body: JSON.stringify(receiverData),
        },
        { walletId: selectedWalletId || null },
      );
    },
    onSuccess,
  });

  return {
    ...mutation,
    error: mutation.error as AppError,
    data: mutation.data as ApiReceiver,
    mutateAsync: async (receiverData: CreateReceiverRequest) => {
      try {
        await mutation.mutateAsync(receiverData);
      } catch {
        // do nothing
      }
    },
  };
};
