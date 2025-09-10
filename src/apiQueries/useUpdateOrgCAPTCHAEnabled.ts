import { useMutation } from "@tanstack/react-query";
import { API_URL } from "@/constants/envVariables";
import { fetchApi } from "@/helpers/fetchApi";
import { AppError } from "@/types";

export const useUpdateOrgCAPTCHAEnabled = () => {
  const mutation = useMutation({
    mutationFn: (isEnabled: boolean) => {
      const formData = new FormData();

      formData.append("data", `{"captcha_enabled": ${isEnabled}}`);

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
    mutateAsync: async (isEnabled: boolean) => {
      try {
        await mutation.mutateAsync(isEnabled);
      } catch {
        // do nothing
      }
    },
  };
};
