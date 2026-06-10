import { useQuery } from "@tanstack/react-query";

import { API_URL } from "@/constants/envVariables";

import { fetchApi } from "@/helpers/fetchApi";

import { AppError } from "@/types";

export type DistributionWallet = {
  id: string;
  name: string;
  status: "ACTIVE" | "ARCHIVED";
  is_default: boolean;
};

// The tenant's distribution wallets (sending accounts). Archived wallets are hidden from this
// operational surface by the API.
export const useDistributionWallets = (isAuthenticated: boolean) => {
  return useQuery<DistributionWallet[], AppError>({
    queryKey: ["distribution-wallets"],
    queryFn: async () => {
      return await fetchApi(`${API_URL}/distribution-wallets`);
    },
    enabled: Boolean(isAuthenticated),
  });
};
