import { useMutation } from "@tanstack/react-query";
import { API_URL } from "constants/envVariables";
import { fetchApi } from "helpers/fetchApi";
import { AppError } from "types";

export const useUpdateOrgPaymentCancellationPeriodDays = () => {
  const mutation = useMutation({
    mutationFn: (cancellationPeriod: number) => {
      const formData = new FormData();

      formData.append(
        "data",
        `{"payment_cancellation_period_days": ${cancellationPeriod}}`,
      );

      return fetchApi(
        `${API_URL}/organization`,
        {
          method: "PATCH",
          body: formData,
        },
        { omitContentType: true },
      );
    },
  });

  return {
    ...mutation,
    error: mutation.error as AppError,
    data: mutation.data as { message: string },
    mutateAsync: async (cancellationPeriod: number) => {
      try {
        await mutation.mutateAsync(cancellationPeriod);
      } catch {
        // do nothing
      }
    },
  };
};
