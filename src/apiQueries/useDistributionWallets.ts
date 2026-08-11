import { useQuery } from "@tanstack/react-query";

import { API_URL } from "@/constants/envVariables";

import { fetchApi } from "@/helpers/fetchApi";

import { AppError } from "@/types";

export type DistributionWallet = {
  id: string;
  name: string;
  description?: string;
  distribution_account_address?: string | null;
  status: "ACTIVE" | "ARCHIVED";
  is_default: boolean;
};

// The tenant's distribution wallets (sending accounts). The API hides archived wallets from this
// operational surface unless include_archived=true. That stays opt-in: only surfaces that label
// past activity want archived accounts — anything that offers an account to send from must not.
export const useDistributionWallets = (isAuthenticated: boolean, includeArchived = false) => {
  return useQuery<DistributionWallet[], AppError>({
    // Vary the key on the flag, or the two lists would overwrite each other in the cache and an
    // archived account could leak into the switcher and the create flows.
    queryKey: ["distribution-wallets", includeArchived ? "with-archived" : "active"],
    queryFn: async () => {
      return await fetchApi(
        `${API_URL}/distribution-wallets${includeArchived ? "?include_archived=true" : ""}`,
      );
    },
    enabled: Boolean(isAuthenticated),
  });
};
