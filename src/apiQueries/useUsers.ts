import { useQuery } from "@tanstack/react-query";
import { API_URL } from "constants/envVariables";
import { fetchApi } from "helpers/fetchApi";
import { ApiUser, AppError } from "types";

export const useUsers = () => {
  const query = useQuery<ApiUser[], AppError>({
    queryKey: ["users"],
    queryFn: async () => {
      return await fetchApi(`${API_URL}/users`);
    },
  });

  return query;
};
