import { useQuery } from "@tanstack/react-query";
import { handleSearchParams } from "api/handleSearchParams";
import { API_URL } from "constants/envVariables";
import { fetchApi } from "helpers/fetchApi";
import { ApiPayments, AppError, PaymentsSearchParams } from "types";

export const usePayments = (searchParams?: PaymentsSearchParams) => {
  // ALL status is for UI only
  if (searchParams?.status === "ALL") {
    delete searchParams.status;
  }

  const params = handleSearchParams(searchParams);

  const query = useQuery<ApiPayments, AppError>({
    queryKey: ["payments", { ...searchParams }],
    queryFn: async () => {
      return await fetchApi(`${API_URL}/payments/${params}`);
    },
    placeholderData: (prev) => prev,
  });

  return query;
};
