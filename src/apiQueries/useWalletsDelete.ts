import { useMutation } from "@tanstack/react-query";

import { API_URL } from "@/constants/envVariables";
import { SESSION_EXPIRED } from "@/constants/settings";

import { getSdpTenantName } from "@/helpers/getSdpTenantName";
import { localStorageSessionToken } from "@/helpers/localStorageSessionToken";

import { AppError } from "@/types";

type WalletsDeleteProps = {
  walletId: string;
};

export const useWalletsDelete = () => {
  const mutation = useMutation({
    mutationFn: async ({ walletId }: WalletsDeleteProps) => {
      const token = localStorageSessionToken.get();

      if (!token) {
        throw SESSION_EXPIRED;
      }

      const response = await fetch(`${API_URL}/wallets/${walletId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "SDP-Tenant-Name": getSdpTenantName(),
        },
      });

      if (response.status === 401) {
        throw SESSION_EXPIRED;
      }

      if (response.status === 204) {
        return { message: "Wallet deleted successfully" };
      }

      throw new Error(`Failed to delete wallet: ${response.status}`);
    },
  });

  return {
    ...mutation,
    error: mutation.error as AppError,
    data: mutation.data as { message: string },
    mutateAsync: async ({ walletId }: WalletsDeleteProps) => {
      try {
        await mutation.mutateAsync({ walletId });
      } catch {
        // do nothing
      }
    },
  };
};
