import { useMutation } from "@tanstack/react-query";
import { API_URL } from "constants/envVariables";
import { fetchApi } from "helpers/fetchApi";
import { normalizeApiError } from "helpers/normalizeApiError";
import { getSdpTenantName } from "helpers/getSdpTenantName";
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
          headers: {
            "SDP-Tenant-Name": getSdpTenantName(organizationName),
          },
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
      } catch {
        // do nothing
      }
    },
  };
};
