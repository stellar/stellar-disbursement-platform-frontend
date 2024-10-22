import { useMutation } from "@tanstack/react-query";
import { API_URL } from "constants/envVariables";
import { fetchApi } from "helpers/fetchApi";
import { ApiNewUser, AppError, NewUser } from "types";

export const useCreateNewUser = () => {
  const mutation = useMutation({
    mutationFn: (newUser: NewUser) => {
      return fetchApi(`${API_URL}/users`, {
        method: "POST",
        body: JSON.stringify({
          first_name: newUser.first_name,
          last_name: newUser.last_name,
          roles: [newUser.role],
          email: newUser.email,
        }),
      });
    },
  });

  return {
    ...mutation,
    error: mutation.error as AppError,
    data: mutation.data as ApiNewUser,
    mutateAsync: async (newUser: NewUser) => {
      try {
        await mutation.mutateAsync(newUser);
      } catch {
        // do nothing
      }
    },
  };
};
