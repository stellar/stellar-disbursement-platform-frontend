import { useQuery } from "@tanstack/react-query";
import { API_URL } from "constants/envVariables";
import { fetchApi } from "helpers/fetchApi";
import { ApiAsset, AppError, hasWallet, RegistrationContactType } from "types";

export const useAssetsByWallet = ({
  walletId,
  registrationContactType,
}: {
  walletId: string | undefined;
  registrationContactType: RegistrationContactType | undefined;
}) => {
  const query = useQuery<ApiAsset[], AppError>({
    queryKey: ["assets", "wallet", { walletId, registrationContactType }],
    queryFn: async () => {
      if (!walletId && !hasWallet(registrationContactType)) {
        return;
      }
      const url = new URL(`${API_URL}/assets`);
      if (walletId) {
        url.searchParams.append("wallet", walletId);
      }

      return await fetchApi(url.toString());
    },
    enabled: Boolean(walletId) || hasWallet(registrationContactType),
  });

  return query;
};
