import { useQuery } from "@tanstack/react-query";
import { API_URL } from "constants/settings";
import { fetchApi } from "helpers/fetchApi";
import { AppError } from "types";

export const useVerificationTypes = () => {
  const query = useQuery<string[], AppError>({
    queryKey: ["receivers", "verification-types"],
    queryFn: async () => {
      return await fetchApi(`${API_URL}/receivers/verification-types`);
    },
  });

  return query;
};
