import { useMutation } from "@tanstack/react-query";
import { API_URL } from "constants/envVariables";
import { fetchApi } from "helpers/fetchApi";
import { AppError } from "types";

export const useUpdateOrgInvitationRetryInterval = () => {
  const mutation = useMutation({
    mutationFn: (retryInterval: number) => {
      const formData = new FormData();

      formData.append(
        "data",
        `{"receiver_invitation_resend_interval_days": ${retryInterval}}`,
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
    mutateAsync: async (retryInterval: number) => {
      try {
        await mutation.mutateAsync(retryInterval);
      } catch {
        // do nothing
      }
    },
  };
};
