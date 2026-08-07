import { useMutation, useQueryClient } from "@tanstack/react-query";

import { API_URL } from "@/constants/envVariables";

import { fetchApi } from "@/helpers/fetchApi";

import { AppError } from "@/types";

type RevokeMembershipProps = {
  walletId: string;
  membershipId: string;
};

// Owner-only: revoke a user's access to a distribution account.
export const useRevokeWalletMembership = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ walletId, membershipId }: RevokeMembershipProps) => {
      await fetchApi(`${API_URL}/distribution-wallets/${walletId}/memberships/${membershipId}`, {
        method: "DELETE",
      });

      // fetchApi resolves null on the 204, so return the message to keep `data`'s shape.
      return { message: "Access revoked" };
    },
    onSuccess: (_data, { walletId }) => {
      queryClient.invalidateQueries({ queryKey: ["wallet-memberships", walletId] });
    },
  });

  return {
    ...mutation,
    error: mutation.error as AppError,
    data: mutation.data as { message: string },
  };
};
