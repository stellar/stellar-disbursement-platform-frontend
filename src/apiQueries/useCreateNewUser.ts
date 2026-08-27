import { useMutation } from "@tanstack/react-query";
import { API_URL } from "@/constants/envVariables";
import { fetchApi } from "@/helpers/fetchApi";
import { ApiNewUser, AppError, NewUser } from "@/types";

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
          // Scopes the new user's wallet membership to one distribution account. Omitted rather
          // than sent empty when there was no choice to make: the backend 400s on owner +
          // wallet_id, and on a single-account tenant its default-wallet fallback resolves to
          // the only account anyway.
          ...(newUser.wallet_id ? { wallet_id: newUser.wallet_id } : {}),
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
