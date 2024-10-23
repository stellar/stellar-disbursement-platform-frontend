import { useMutation } from "@tanstack/react-query";
import { API_URL } from "constants/envVariables";
import { fetchApi } from "helpers/fetchApi";
import { AppError } from "types";

type UserActivationProps = {
  userId: string;
  isActive: boolean;
};

export const useUpdateUserStatus = () => {
  const mutation = useMutation({
    mutationFn: ({ userId, isActive }: UserActivationProps) => {
      return fetchApi(`${API_URL}/users/activation`, {
        method: "PATCH",
        body: JSON.stringify({
          user_id: userId,
          is_active: isActive,
        }),
      });
    },
  });

  return {
    ...mutation,
    error: mutation.error as AppError,
    data: mutation.data as { message: string },
    mutateAsync: async ({ userId, isActive }: UserActivationProps) => {
      try {
        await mutation.mutateAsync({ userId, isActive });
      } catch {
        // do nothing
      }
    },
  };
};
