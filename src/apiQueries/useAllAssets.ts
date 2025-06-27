import { useQuery } from "@tanstack/react-query";
import { API_URL } from "constants/envVariables";
import { fetchApi } from "helpers/fetchApi";
import { ApiAsset, AppError } from "types";

export const useAllAssets = () => {
  const query = useQuery<ApiAsset[], AppError>({
    queryKey: ["assets", "all"],
    queryFn: async () => {
      return await fetchApi(`${API_URL}/assets`);
    },
    staleTime: 5 * 60 * 1000, // Keep data fresh for 5 minutes
  });

  return query;
};
