import { useMutation } from "@tanstack/react-query";
import { API_URL } from "@/constants/envVariables";
import { fetchApi } from "@/helpers/fetchApi";
import { ApiPayment, AppError, CreateDirectPaymentRequest } from "@/types";

// The source account is chosen per payment in the create modal, not taken from the app-wide
// selection, so it travels with the mutation call rather than the hook.
type CreateDirectPaymentVariables = {
  paymentData: CreateDirectPaymentRequest;
  sourceWalletId?: string;
};

export const useCreateDirectPayment = ({
  onSuccess,
}: {
  onSuccess: (payment: ApiPayment) => void;
}) => {
  const mutation = useMutation({
    mutationFn: ({ paymentData, sourceWalletId }: CreateDirectPaymentVariables) => {
      return fetchApi(
        `${API_URL}/payments`,
        {
          method: "POST",
          body: JSON.stringify(paymentData),
        },
        { walletId: sourceWalletId ?? null },
      );
    },
    onSuccess,
  });

  return {
    ...mutation,
    error: mutation.error as AppError,
    data: mutation.data as ApiPayment,
    mutateAsync: async (variables: CreateDirectPaymentVariables) => {
      try {
        await mutation.mutateAsync(variables);
      } catch {
        // do nothing
      }
    },
  };
};
