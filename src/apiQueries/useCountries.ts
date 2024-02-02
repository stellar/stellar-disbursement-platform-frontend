import { useQuery } from "@tanstack/react-query";
import { API_URL } from "constants/envVariables";
import { fetchApi } from "helpers/fetchApi";
import { ApiCountry, AppError } from "types";

export const useCountries = () => {
  const query = useQuery<ApiCountry[], AppError>({
    queryKey: ["countries"],
    queryFn: async () => {
      return await fetchApi(`${API_URL}/countries`);
    },
    // Keeping the fetched data for longer since it won't change that often
    staleTime: 5 * 60 * 1000,
  });

  return query;
};
