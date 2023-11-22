import { useMutation } from "@tanstack/react-query";
import { API_URL } from "constants/settings";
import { fetchApi } from "helpers/fetchApi";
import { AppError } from "types";

type ResetPasswordProps = {
  organizationName: string;
  password: string;
  resetToken: string;
};

export const useResetPassword = () => {
  const mutation = useMutation({
    mutationFn: ({
      organizationName,
      password,
      resetToken,
    }: ResetPasswordProps) => {
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
          customCallback: (response) => {
            if (response.status === 200) {
              return true;
            }

            return response;
          },
          organizationName,
        },
      );
    },
    cacheTime: 0,
  });

  return {
    ...mutation,
    error: mutation.error as AppError,
    data: mutation.data as boolean,
    mutateAsync: async ({
      organizationName,
      password,
      resetToken,
    }: ResetPasswordProps) => {
      try {
        await mutation.mutateAsync({ organizationName, password, resetToken });
      } catch (e) {
        // do nothing
      }
    },
  };
};
