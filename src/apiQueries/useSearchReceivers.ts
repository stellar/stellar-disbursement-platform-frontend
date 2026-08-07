import { useQuery } from "@tanstack/react-query";
import { API_URL } from "@/constants/envVariables";
import { fetchApi } from "@/helpers/fetchApi";
import { handleSearchParams } from "@/api/handleSearchParams";
import { directPayment } from "@/constants/directPayment";
import { ALL_ACCOUNTS } from "@/helpers/localStorageSelectedWallet";

import { ApiReceivers, AppError } from "@/types";

export const useSearchReceivers = (
  searchQuery: string,
  enabled: boolean = true,
  selectedWalletId?: string | null,
) => {
  const canRun = Boolean(enabled && searchQuery.trim().length >= directPayment.SEARCH_MIN_CHARS);

  // Search is wallet-scoped on the wire, so the cache entry is keyed by the same account that
  // produced its X-Wallet-Id header. The segment goes AFTER "search" so the prefix
  // removeQueries(["receivers", "search"]) in DirectPaymentCreateModal keeps matching.
  const walletKey = selectedWalletId || ALL_ACCOUNTS;

  const query = useQuery<ApiReceivers, AppError>({
    queryKey: ["receivers", "search", walletKey, { q: searchQuery }],
    queryFn: async () => {
      const params = handleSearchParams({
        q: searchQuery,
        page: "1",
        page_limit: directPayment.SEARCH_PAGE_LIMIT,
      });
      return await fetchApi(`${API_URL}/receivers${params}`, undefined, {
        walletId: selectedWalletId || null,
      });
    },
    enabled: canRun,
    staleTime: 30 * 1000, // Keep results for 30 seconds
  });

  return query;
};
