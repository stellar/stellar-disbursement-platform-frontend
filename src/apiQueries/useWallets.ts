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
