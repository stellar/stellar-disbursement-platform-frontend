import { useMutation } from "@tanstack/react-query";
import { API_URL } from "constants/settings";
import { fetchApi } from "helpers/fetchApi";
import { AppError } from "types";

type ForgotPasswordLinkProps = {
  organizationName: string;
  email: string;
  recaptchaToken: string;
};

export const useForgotPasswordLink = () => {
  const mutation = useMutation({
    mutationFn: ({
      organizationName,
      email,
      recaptchaToken,
    }: ForgotPasswordLinkProps) => {
      return fetchApi(
        `${API_URL}/forgot-password`,
        {
          method: "POST",
          body: JSON.stringify({
            email,
            recaptcha_token: recaptchaToken,
          }),
        },
        {
          withoutAuth: true,
          organizationName,
        },
      );
    },
    cacheTime: 0,
  });

  return {
    ...mutation,
    error: mutation.error as AppError,
    data: mutation.data as { message: string },
    mutateAsync: async ({
      organizationName,
      email,
      recaptchaToken,
    }: ForgotPasswordLinkProps) => {
      try {
        await mutation.mutateAsync({ organizationName, email, recaptchaToken });
      } catch (e) {
        // do nothing
      }
    },
  };
};
