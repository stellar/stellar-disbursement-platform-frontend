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

export const useCircleBalances = (
  walletId: string,
  isActive: boolean = true,
) => {
  const query = useQuery<BalancesApi, AppError>({
    queryKey: ["circle", "balances", { walletId }],
    queryFn: async () => {
      return await fetchApi(`${API_URL}/balances`);
    },
    placeholderData: (prev) => prev,
    enabled: Boolean(isActive && walletId),
  });

  return query;
};
