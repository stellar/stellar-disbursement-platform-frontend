import { useMutation } from "@tanstack/react-query";
import { API_URL } from "constants/envVariables";
import { fetchApi } from "helpers/fetchApi";
import { AppError } from "types";

type ForgotPasswordLinkProps = {
  email: string;
  recaptchaToken: string;
};

export const useForgotPasswordLink = () => {
  const mutation = useMutation({
    mutationFn: ({ email, recaptchaToken }: ForgotPasswordLinkProps) => {
      return fetchApi(
        `${API_URL}/forgot-password`,
        {
          method: "POST",
          body: JSON.stringify({
            email,
            recaptcha_token: recaptchaToken,
          }),
        },
        { withoutAuth: true },
      );
    },
    cacheTime: 0,
  });

  return {
    ...mutation,
    error: mutation.error as AppError,
    data: mutation.data as { message: string },
    mutateAsync: async ({ email, recaptchaToken }: ForgotPasswordLinkProps) => {
      try {
        await mutation.mutateAsync({ email, recaptchaToken });
      } catch (e) {
        // do nothing
      }
    },
  };
};
