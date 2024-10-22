import { useMutation } from "@tanstack/react-query";
import { API_URL } from "constants/envVariables";
import { fetchApi } from "helpers/fetchApi";
import { AppError, UserRole } from "types";

type UserRoleProps = {
  userId: string;
  role: UserRole;
};

export const useUpdateUserRole = () => {
  const mutation = useMutation({
    mutationFn: ({ userId, role }: UserRoleProps) => {
      return fetchApi(`${API_URL}/users/roles`, {
        method: "PATCH",
        body: JSON.stringify({
          user_id: userId,
          roles: [role],
        }),
      });
    },
  });

  return {
    ...mutation,
    error: mutation.error as AppError,
    data: mutation.data as { message: string },
    mutateAsync: async ({ userId, role }: UserRoleProps) => {
      try {
        await mutation.mutateAsync({ userId, role });
      } catch {
        // do nothing
      }
    },
  };
};
