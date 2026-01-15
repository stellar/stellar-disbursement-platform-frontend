import { useQuery } from "@tanstack/react-query";

import { createAuthenticatedRpcServer } from "@/helpers/createAuthenticatedRpcServer";
import { fetchSacBalances } from "@/helpers/stellarBalances";

import { ApiStellarAccountBalance, AppError, EmbeddedWalletSupportedAsset } from "@/types";

export const useWalletBalance = (
  contractAddress: string | undefined,
  assets?: EmbeddedWalletSupportedAsset[],
) => {
  const query = useQuery<ApiStellarAccountBalance[], AppError>({
    queryKey: ["wallet-balance", contractAddress],
    queryFn: async () => {
      if (!contractAddress) {
        throw new Error("Contract address is required");
      }

      const rpcServer = createAuthenticatedRpcServer("wallet");
      const assetDescriptors = (assets ?? []).map((asset) => ({
        code: asset.code,
        issuer: asset.issuer || null,
      }));

      return fetchSacBalances({
        rpcServer,
        stellarAddress: contractAddress,
        assets: assetDescriptors,
      });
    },
    enabled: Boolean(contractAddress && assets !== undefined),
    refetchInterval: 10000,
  });

  return query;
};
