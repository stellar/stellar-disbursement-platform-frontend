import { useQuery } from "@tanstack/react-query";

import { API_URL, HORIZON_URL, RPC_ENABLED } from "@/constants/envVariables";
import { createAuthenticatedRpcServer } from "@/helpers/createAuthenticatedRpcServer";
import { fetchApi } from "@/helpers/fetchApi";
import { fetchStellarApi } from "@/helpers/fetchStellarApi";
import { fetchSacBalances } from "@/helpers/stellarBalances";
import { ApiStellarAccountBalance, AppError } from "@/types";

interface ApiAsset {
  id: string;
  code: string;
  issuer: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export const useAccountBalances = (stellarAddress: string | undefined) => {
  const query = useQuery<ApiStellarAccountBalance[], AppError>({
    queryKey: ["account-balances", stellarAddress],
    queryFn: async () => {
      if (!stellarAddress) {
        return [];
      }

      // If the address is a Stellar address (starts with "G"), fetch from Horizon
      if (stellarAddress.startsWith("G")) {
        const accountInfo = await fetchStellarApi(
          `${HORIZON_URL}/accounts/${stellarAddress}`,
          undefined,
          {
            notFoundMessage: `${stellarAddress} address was not found.`,
          },
        );
        return accountInfo?.balances ?? [];
      } // If the address is a Stellar contract address (starts with "C"), fetch from RPC
      else {
        const assetsUrl = new URL(`${API_URL}/assets`);
        const assets: ApiAsset[] = await fetchApi(assetsUrl.toString());
        const rpcServer = createAuthenticatedRpcServer("user");

        return await fetchSacBalances({
          rpcServer,
          stellarAddress,
          assets: assets.map((apiAsset) => ({
            code: apiAsset.code,
            issuer: apiAsset.issuer,
          })),
        });
      }
    },
    enabled:
      Boolean(stellarAddress) &&
      (stellarAddress!.startsWith("G")
        ? Boolean(HORIZON_URL)
        : Boolean(RPC_ENABLED) && Boolean(API_URL)),
  });

  return query;
};
