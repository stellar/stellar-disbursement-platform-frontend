import { useMutation } from "@tanstack/react-query";
import { API_URL } from "constants/envVariables";
import { fetchApi } from "helpers/fetchApi";
import { normalizeApiError } from "helpers/normalizeApiError";
import { AppError } from "types";

type ResetPasswordProps = {
  password: string;
  resetToken: string;
};

export const useResetPassword = () => {
  const mutation = useMutation({
    mutationFn: ({ password, resetToken }: ResetPasswordProps) => {
      return fetchApi(
        `${API_URL}/reset-password`,
        {
          method: "POST",
          body: JSON.stringify({
            password,
            reset_token: resetToken,
          }),
        },
        {
          withoutAuth: true,
          customCallback: async (response) => {
            if (response.status === 200) {
              return true;
            }

            const responseJson = await response.json();

            if (responseJson?.error) {
              throw normalizeApiError(responseJson);
            }

            return responseJson;
          },
        },
      );
    },
    cacheTime: 0,
  });

  return {
    ...mutation,
    error: mutation.error as AppError,
    data: mutation.data as boolean,
    mutateAsync: async ({ password, resetToken }: ResetPasswordProps) => {
      try {
        await mutation.mutateAsync({ password, resetToken });
      } catch (e) {
        // do nothing
      }
    },
  };
};
