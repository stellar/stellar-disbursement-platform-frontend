import { useQuery } from "@tanstack/react-query";

import { API_URL } from "@/constants/envVariables";

import { handleSearchParams } from "@/api/handleSearchParams";

import { fetchApi } from "@/helpers/fetchApi";

import { ApiUser, AppError, UsersSearchParams } from "@/types";

export const useUsers = (searchParams?: UsersSearchParams) => {
  const params = handleSearchParams(searchParams);

  const query = useQuery<ApiUser[], AppError>({
    // Sort params belong in the key: the server does the ordering, so two orderings
    // are two different responses, not one response rendered two ways.
    queryKey: ["users", { ...searchParams }],
    queryFn: async () => {
      return await fetchApi(`${API_URL}/users${params}`);
    },
  });

  return query;
};
