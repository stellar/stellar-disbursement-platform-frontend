import { useMutation } from "@tanstack/react-query";
import { API_URL } from "constants/settings";
import { fetchApi } from "helpers/fetchApi";
import { AppError } from "types";

export const useUpdateOrgSmsRetryInterval = () => {
  const mutation = useMutation({
    mutationFn: (retryInterval: number) => {
      const formData = new FormData();

      formData.append("data", `{"sms_resend_interval": ${retryInterval}}`);

      return fetchApi(
        `${API_URL}/organization`,
        {
          method: "PATCH",
          body: formData,
        },
        { omitContentType: true },
      );
    },
    cacheTime: 0,
  });

  return {
    ...mutation,
    error: mutation.error as AppError,
    data: mutation.data as { message: string },
    mutateAsync: async (retryInterval: number) => {
      try {
        await mutation.mutateAsync(retryInterval);
      } catch (e) {
        // do nothing
      }
    },
  };
};
