import { useQuery } from "@tanstack/react-query";

import { createAuthenticatedRpcServer } from "@/helpers/createAuthenticatedRpcServer";
import { fetchSACBalances } from "@/helpers/stellarBalances";
import { AppError } from "@/types";

interface WalletBalance {
  asset_code: string;
  balance: string;
}

export const useWalletBalance = (contractAddress: string | undefined) => {
  const query = useQuery<WalletBalance, AppError>({
    queryKey: ["wallet-balance", contractAddress],
    queryFn: async () => {
      if (!contractAddress) {
        throw new Error("Contract address is required");
      }

      const rpcServer = createAuthenticatedRpcServer("wallet");

      const [walletBalance] =
        (await fetchSACBalances({
          rpcServer,
          stellarAddress: contractAddress,
          assets: [{ code: "XLM", issuer: null }],
        })) ?? [];

      return {
        asset_code: walletBalance?.asset_code ?? "XLM",
        balance: walletBalance?.balance ?? "0",
      };
    },
    enabled: Boolean(contractAddress),
    refetchInterval: 10000,
  });

  return query;
};
