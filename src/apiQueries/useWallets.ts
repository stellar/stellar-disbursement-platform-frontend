import { useQuery } from "@tanstack/react-query";
import { API_URL } from "constants/settings";
import { fetchApi } from "helpers/fetchApi";
import { ApiWallet, AppError } from "types";

export const useWallets = () => {
  const query = useQuery<ApiWallet[], AppError>({
    queryKey: ["wallets"],
    queryFn: async () => {
      return await fetchApi(`${API_URL}/wallets`);
    },
  });

  return query;
};
