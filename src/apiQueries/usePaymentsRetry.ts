import { useQuery } from "@tanstack/react-query";
import { API_URL } from "constants/settings";
import { fetchApi } from "helpers/fetchApi";
import { AppError } from "types";

export const usePaymentsRetry = (paymentIds: string[]) => {
  const query = useQuery<{ message: string }, AppError>({
    queryKey: ["payments", "retry", { paymentIds }],
    queryFn: async () => {
      return await fetchApi(`${API_URL}/payments/retry`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payment_ids: paymentIds,
        }),
      });
    },
    // Don't fire the query on mount
    enabled: false,
  });

  return query;
};
