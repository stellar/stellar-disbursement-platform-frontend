import { useQuery } from "@tanstack/react-query";
import { API_URL } from "constants/envVariables";
import { fetchApi } from "helpers/fetchApi";
import { ApiAsset, ApiAssetWithTrustline, AppError } from "types";

export const useAllAssets = (options?: { hasTrustline?: boolean }) => {
  const query = useQuery<ApiAsset[] | ApiAssetWithTrustline[], AppError>({
    queryKey: ["assets", "all", options?.hasTrustline],
    queryFn: async () => {
      const params =
        options?.hasTrustline !== undefined ? `?hasTrustline=${options.hasTrustline}` : "";
      return await fetchApi(`${API_URL}/assets${params}`);
    },
    staleTime: 5 * 60 * 1000,
  });

  return query;
};
