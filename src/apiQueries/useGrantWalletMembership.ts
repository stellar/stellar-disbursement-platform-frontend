import { useMutation, useQueryClient } from "@tanstack/react-query";

import { API_URL } from "@/constants/envVariables";

import { fetchApi } from "@/helpers/fetchApi";

import { AppError, UserRole } from "@/types";

type GrantMembershipProps = {
  walletId: string;
  userId: string;
  role: UserRole;
};

// Owner-only: grant a user access to a specific distribution account at a wallet-scoped role.
export const useGrantWalletMembership = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ walletId, userId, role }: GrantMembershipProps) => {
      return fetchApi(`${API_URL}/distribution-wallets/${walletId}/memberships`, {
        method: "POST",
        body: JSON.stringify({ user_id: userId, role }),
      });
    },
    onSuccess: (_data, { walletId }) => {
      queryClient.invalidateQueries({ queryKey: ["wallet-memberships", walletId] });
    },
  });

  return {
    ...mutation,
    error: mutation.error as AppError,
  };
};
