import { useQuery } from "@tanstack/react-query";
import { API_URL } from "constants/envVariables";
import { fetchApi } from "helpers/fetchApi";
import { ApiWallet, AppError } from "types";

type UseWalletsProps = {
  userManaged?: boolean;
};

export const useWallets = ({ userManaged }: UseWalletsProps) => {
  const query = useQuery<ApiWallet[], AppError>({
    queryKey: ["wallets"],
    queryFn: async () => {
      const url = new URL(`${API_URL}/wallets`);

      if (userManaged !== undefined) {
        url.searchParams.append("user_managed", userManaged.toString());
      }

      return await fetchApi(url.toString());
    },
  });

  return query;
};

export const useAllWallets = () => {
  const query = useQuery<ApiWallet[], AppError>({
    queryKey: ["wallets", "all"],
    queryFn: async () => {
      return await fetchApi(`${API_URL}/wallets`);
    },
    staleTime: 5 * 60 * 1000, // Keep data fresh for 5 minutes
  });

  return query;
};
