import { useQuery } from "@tanstack/react-query";
import { API_URL } from "constants/envVariables";
import { fetchApi } from "helpers/fetchApi";
import { sanitizeObject } from "helpers/sanitizeObject";
import { AppError } from "types";

export const useUpdateCircleConfig = ({
  api_key,
  wallet_id,
}: {
  api_key?: string;
  wallet_id?: string;
}) => {
  const sanitizeObj = sanitizeObject({ api_key, wallet_id });

  const query = useQuery<{ message: string }, AppError>({
    queryKey: ["organization", "circle", "config", { api_key, wallet_id }],
    queryFn: async () => {
      return await fetchApi(`${API_URL}/organization/circle-config`, {
        method: "PATCH",
        body: JSON.stringify(sanitizeObj),
      });
    },
    // Don't fire the query on mount
    enabled: false,
  });

  return query;
};
