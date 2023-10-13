import { useQuery } from "@tanstack/react-query";
import { API_URL } from "constants/settings";
import { fetchApi } from "helpers/fetchApi";
import { formatStatistics } from "helpers/formatStatistics";
import { ApiStatistics, AppError } from "types";

export const useStatistics = (isAuthenticated: boolean) => {
  const query = useQuery<ApiStatistics, AppError>({
    queryKey: ["statistics"],
    queryFn: async () => {
      return await fetchApi(`${API_URL}/statistics`);
    },
    enabled: Boolean(isAuthenticated),
  });

  return {
    ...query,
    data: query.data ? formatStatistics(query.data) : undefined,
  };
};
