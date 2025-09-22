import { useQuery } from "@tanstack/react-query";
import { API_URL } from "@/constants/envVariables";
import { fetchApi } from "@/helpers/fetchApi";
import { handleSearchParams } from "@/api/handleSearchParams";
import { directPayment } from "@/constants/directPayment";

import { ApiReceivers, AppError } from "@/types";

export const useSearchReceivers = (searchQuery: string, enabled: boolean = true) => {
  const canRun = Boolean(enabled && searchQuery.trim().length >= directPayment.SEARCH_MIN_CHARS);

  const query = useQuery<ApiReceivers, AppError>({
    queryKey: ["receivers", "search", { q: searchQuery }],
    queryFn: async () => {
      const params = handleSearchParams({
        q: searchQuery,
        page: "1",
        page_limit: directPayment.SEARCH_PAGE_LIMIT,
      });
      return await fetchApi(`${API_URL}/receivers${params}`);
    },
    enabled: canRun,
    staleTime: 30 * 1000, // Keep results for 30 seconds
  });

  return query;
};
