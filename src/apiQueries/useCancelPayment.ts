import { useMutation } from "@tanstack/react-query";
import { API_URL } from "constants/envVariables";
import { CANCELED_PAYMENT_STATUS } from "constants/settings";
import { fetchApi } from "helpers/fetchApi";
import { AppError } from "types";

export const useCancelPayment = () => {
  const mutation = useMutation({
    mutationFn: ({ paymentId }: { paymentId: string }) => {
      return fetchApi(`${API_URL}/payments/${paymentId}/status`, {
        method: "PATCH",
        body: JSON.stringify({
          status: CANCELED_PAYMENT_STATUS,
        }),
      });
    },
  });

  return {
    ...mutation,
    error: mutation.error as AppError,
    data: mutation.data as { message: string },
    mutateAsync: async ({ paymentId }: { paymentId: string }) => {
      try {
        await mutation.mutateAsync({ paymentId });
      } catch {
        // do nothing
      }
    },
  };
};
