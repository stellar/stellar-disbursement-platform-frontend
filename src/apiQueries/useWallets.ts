import { useQuery } from "@tanstack/react-query";

import { API_URL } from "@/constants/envVariables";

import { fetchApi } from "@/helpers/fetchApi";

import { ApiWallet, AppError } from "@/types";

type UseWalletsProps = {
  userManaged?: boolean;
  supportedAssets?: string[];
};

export const useWallets = ({ userManaged, supportedAssets }: UseWalletsProps) => {
  const query = useQuery<ApiWallet[], AppError>({
    queryKey: ["wallets", { userManaged, supportedAssets }],
    queryFn: async () => {
      const url = new URL(`${API_URL}/wallets`);

      if (userManaged !== undefined) {
        url.searchParams.append("user_managed", userManaged.toString());
      }

      if (supportedAssets && supportedAssets.length > 0) {
        url.searchParams.set("supported_assets", supportedAssets.join(","));
      }

      return await fetchApi(url.toString());
    },
  });

  return query;
};
