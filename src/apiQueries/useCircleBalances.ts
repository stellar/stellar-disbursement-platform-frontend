import { useQuery } from "@tanstack/react-query";
import { API_URL } from "constants/envVariables";
import { fetchApi } from "helpers/fetchApi";
import { AppError } from "types";

type BalancesApi = {
  account: {
    circle_wallet_id: string;
    status: string;
    type: string;
  };
  balances: {
    amount: string;
    asset_code: string;
    asset_issuer: string;
  }[];
};

export const useCircleBalances = (hasAccount: boolean) => {
  const query = useQuery<BalancesApi, AppError>({
    queryKey: ["circle", "balances"],
    queryFn: async () => {
      return await fetchApi(`${API_URL}/balances`);
    },
    keepPreviousData: true,
    enabled: hasAccount,
  });

  return query;
};
