import { useMutation } from "@tanstack/react-query";
import { API_URL } from "constants/settings";
import { fetchApi } from "helpers/fetchApi";
import { AppError } from "types";

export const useCancelPayment = () => {
  const mutation = useMutation({
    mutationFn: ({ paymentId }: { paymentId: string | undefined }) => {
      return fetchApi(`${API_URL}/payments/${paymentId}/status`, {
        method: "PATCH",
        body: JSON.stringify({
          status: "CANCELED",
        }),
      });
    },
    cacheTime: 0,
  });

  return {
    ...mutation,
    error: mutation.error as AppError,
    data: mutation.data as { message: string },
    mutateAsync: async ({ paymentId }: { paymentId: string | undefined }) => {
      try {
        await mutation.mutateAsync({ paymentId });
      } catch (e) {
        // do nothing
      }
    },
  };
};
