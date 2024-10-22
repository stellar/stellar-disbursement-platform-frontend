import { useMutation } from "@tanstack/react-query";
import { API_URL } from "constants/envVariables";
import { fetchApi } from "helpers/fetchApi";
import { sanitizeObject } from "helpers/sanitizeObject";
import { AppError } from "types";

type NewPasswordFields = {
  currentPassword?: string;
  newPassword?: string;
};

export const useNewPassword = () => {
  const mutation = useMutation({
    mutationFn: ({ currentPassword, newPassword }: NewPasswordFields) => {
      const fieldsToSubmit = sanitizeObject({
        current_password: currentPassword,
        new_password: newPassword,
      });

      if (Object.keys(fieldsToSubmit).length < 2) {
        throw Error(
          "Update profile password requires current password and new password.",
        );
      }

      return fetchApi(`${API_URL}/profile/reset-password`, {
        method: "PATCH",
        body: JSON.stringify(fieldsToSubmit),
      });
    },
  });

  return {
    ...mutation,
    error: mutation.error as AppError,
    data: mutation.data as { message: string },
    mutateAsync: async ({
      currentPassword,
      newPassword,
    }: NewPasswordFields) => {
      try {
        await mutation.mutateAsync({ currentPassword, newPassword });
      } catch {
        // do nothing
      }
    },
  };
};
