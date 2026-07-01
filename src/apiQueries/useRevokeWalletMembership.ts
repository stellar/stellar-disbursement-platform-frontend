import { useMutation, useQueryClient } from "@tanstack/react-query";

import { API_URL } from "@/constants/envVariables";
import { SESSION_EXPIRED } from "@/constants/settings";

import { getSdpTenantName } from "@/helpers/getSdpTenantName";
import { localStorageSessionToken } from "@/helpers/localStorageSessionToken";

import { AppError } from "@/types";

type RevokeMembershipProps = {
  walletId: string;
  membershipId: string;
};

// Owner-only: revoke a user's access to a distribution account. Uses a raw fetch (not fetchApi)
// so the 204 No Content response is handled cleanly, matching useWalletsDelete.
export const useRevokeWalletMembership = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ walletId, membershipId }: RevokeMembershipProps) => {
      const token = localStorageSessionToken.get();

      if (!token) {
        throw SESSION_EXPIRED;
      }

      const response = await fetch(
        `${API_URL}/distribution-wallets/${walletId}/memberships/${membershipId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "SDP-Tenant-Name": getSdpTenantName(),
          },
        },
      );

      if (response.status === 401) {
        throw SESSION_EXPIRED;
      }

      if (response.status === 204) {
        return { message: "Access revoked" };
      }

      throw new Error(`Failed to revoke access: ${response.status}`);
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
