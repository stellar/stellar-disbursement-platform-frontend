import { useQuery } from "@tanstack/react-query";

import { API_URL } from "@/constants/envVariables";

import { fetchApi } from "@/helpers/fetchApi";

import { ApiWallet, AppError } from "@/types";

type UseWalletsProps = {
  userManaged?: boolean;
  supportedAssets?: string[];
  walletId?: string | null;
};

export const useWallets = ({ userManaged, supportedAssets, walletId }: UseWalletsProps) => {
  const query = useQuery<ApiWallet[], AppError>({
    queryKey: ["wallets", { userManaged, supportedAssets, walletId }],
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
    // Only fetch if walletId is not provided or is a non-empty string
    enabled: walletId === undefined ? true : !!walletId,
  });

  return query;
};
