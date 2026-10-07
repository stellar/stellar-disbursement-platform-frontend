import { useQuery } from "@tanstack/react-query";
import { API_URL } from "@/constants/envVariables";
import { fetchApi } from "@/helpers/fetchApi";
import { ALL_ACCOUNTS } from "@/helpers/localStorageSelectedWallet";
import { useSelectedWallet } from "@/hooks/useSelectedWallet";
import { ApiAsset, ApiAssetWithTrustline, AppError } from "@/types";

export const useAllAssets = (options?: { enabled?: boolean }) => {
  const { selectedWalletId } = useSelectedWallet();

  // `enabled` and `balance` are per-account facts, not tenant config: with ?enabled the backend
  // reads them from the account named by X-Wallet-Id, falling back to the tenant default when
  // the header is absent. Without the filter the endpoint ignores the header entirely, so we
  // send nothing there and keep one shared cache entry instead of fragmenting it per account.
  // "All accounts" ("") sends no header and keeps the pre-existing default-account behaviour.
  const walletId = options?.enabled !== undefined ? selectedWalletId || null : null;

  const query = useQuery<ApiAsset[] | ApiAssetWithTrustline[], AppError>({
    // Keyed by the same account that produced the X-Wallet-Id header. Without the segment,
    // switching accounts would serve the previous account's enabled/balance data from cache
    // (and the 5-minute staleTime would keep serving it).
    queryKey: ["assets", "all", walletId ?? ALL_ACCOUNTS, { hasTrustline: options?.enabled }],
    queryFn: async () => {
      const params = options?.enabled !== undefined ? `?enabled=${options.enabled}` : "";
      return await fetchApi(`${API_URL}/assets${params}`, undefined, { walletId });
    },
    staleTime: 5 * 60 * 1000, // Keep data fresh for 5 minutes
  });

  return query;
};
