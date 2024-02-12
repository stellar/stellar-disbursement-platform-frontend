import { useQuery } from "@tanstack/react-query";
import { handleSearchParams } from "api/handleSearchParams";
import { API_URL } from "constants/envVariables";
import { fetchApi } from "helpers/fetchApi";
import { formatReceivers } from "helpers/formatReceivers";
import { ApiReceivers, AppError, ReceiversSearchParams } from "types";

export const useReceivers = (searchParams?: ReceiversSearchParams) => {
  // ALL status is for UI only
  if (searchParams?.status === "ALL") {
    delete searchParams.status;
  }

  const params = handleSearchParams(searchParams);

  const query = useQuery<ApiReceivers, AppError>({
    queryKey: ["receivers", { ...searchParams }],
    queryFn: async () => {
      return await fetchApi(`${API_URL}/receivers/${params}`);
    },
    keepPreviousData: true,
  });

  return {
    ...query,
    data: query.data
      ? {
          ...query.data,
          data: formatReceivers(query.data.data),
        }
      : undefined,
  };
};
