import { useQuery } from "@tanstack/react-query";

import { API_URL } from "@/constants/envVariables";

import { fetchApi } from "@/helpers/fetchApi";

import { AppError, UserRole } from "@/types";

export type WalletMembership = {
  id: string;
  user_id: string;
  wallet_id: string;
  role: UserRole;
  granted_by?: string;
  created_at: string;
  updated_at: string;
};

// Owner-only: who has access to a given distribution account, and at what role. Keyed on the
// wallet so each account's access list is cached and refetched independently.
export const useWalletMemberships = (walletId: string | null) => {
  return useQuery<WalletMembership[], AppError>({
    queryKey: ["wallet-memberships", walletId],
    queryFn: async () => {
      return await fetchApi(`${API_URL}/distribution-wallets/${walletId}/memberships`);
    },
    enabled: Boolean(walletId),
  });
};
