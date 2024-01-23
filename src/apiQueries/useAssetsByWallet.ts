import { useQuery } from "@tanstack/react-query";
import { API_URL } from "constants/envVariables";
import { fetchApi } from "helpers/fetchApi";
import { ApiAsset, AppError } from "types";

export const useAssetsByWallet = (walletId: string) => {
  const query = useQuery<ApiAsset[], AppError>({
    queryKey: ["assets", "wallet", walletId],
    queryFn: async () => {
      if (!walletId) {
        return;
      }

      return await fetchApi(`${API_URL}/assets?wallet=${walletId}`);
    },
    enabled: Boolean(walletId),
  });

  return query;
};
