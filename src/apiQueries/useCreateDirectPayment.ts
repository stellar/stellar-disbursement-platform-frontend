import { useMutation } from "@tanstack/react-query";
import { API_URL } from "constants/envVariables";
import { fetchApi } from "helpers/fetchApi";
import { ApiPayment, AppError, CreateDirectPaymentRequest } from "types";

export const useCreateDirectPayment = ({
  onSuccess,
}: {
  onSuccess: (payment: ApiPayment) => void;
}) => {
  const mutation = useMutation({
    mutationFn: (paymentData: CreateDirectPaymentRequest) => {
      return fetchApi(`${API_URL}/payments`, {
        method: "POST",
        body: JSON.stringify(paymentData),
      });
    },
    onSuccess,
  });

  return {
    ...mutation,
    error: mutation.error as AppError,
    data: mutation.data as ApiPayment,
    mutateAsync: async (paymentData: CreateDirectPaymentRequest) => {
      try {
        await mutation.mutateAsync(paymentData);
      } catch {
        // do nothing
      }
    },
  };
};
