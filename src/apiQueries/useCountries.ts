import { useQuery } from "@tanstack/react-query";
import { API_URL } from "constants/settings";
import { fetchApi } from "helpers/fetchApi";
import { ApiCountry, AppError } from "types";

export const useCountries = () => {
  const query = useQuery<ApiCountry[], AppError>({
    queryKey: ["countries"],
    queryFn: async () => {
      return await fetchApi(`${API_URL}/countries`);
    },
  });

  return query;
};
