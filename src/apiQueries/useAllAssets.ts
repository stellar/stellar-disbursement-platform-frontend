import { useQuery } from "@tanstack/react-query";
import { API_URL } from "@/constants/envVariables";
import { fetchApi } from "@/helpers/fetchApi";
import { ApiAsset, ApiAssetWithTrustline, AppError } from "@/types";

export const useAllAssets = (options?: { enabled?: boolean }) => {
  const query = useQuery<ApiAsset[] | ApiAssetWithTrustline[], AppError>({
    queryKey: ["assets", "all", { hasTrustline: options?.enabled }],
    queryFn: async () => {
      const params = options?.enabled !== undefined ? `?enabled=${options.enabled}` : "";
      return await fetchApi(`${API_URL}/assets${params}`);
    },
    staleTime: 5 * 60 * 1000, // Keep data fresh for 5 minutes
  });

  return query;
};
