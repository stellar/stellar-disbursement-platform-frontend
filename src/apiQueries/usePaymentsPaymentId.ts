import { useQuery } from "@tanstack/react-query";
import { API_URL } from "constants/envVariables";
import { fetchApi } from "helpers/fetchApi";
import { ApiPayment, AppError } from "types";

export const usePaymentsPaymentId = (paymentId: string | undefined) => {
  const query = useQuery<ApiPayment, AppError>({
    queryKey: ["payments", paymentId],
    queryFn: async () => {
      return await fetchApi(`${API_URL}/payments/${paymentId}`);
    },
    enabled: !!paymentId,
  });

  return query;
};
