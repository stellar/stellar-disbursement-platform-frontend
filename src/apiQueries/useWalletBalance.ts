import { Asset, Networks } from "@stellar/stellar-sdk";
import { useQuery } from "@tanstack/react-query";

import { createAuthenticatedRpcServer } from "@/helpers/createAuthenticatedRpcServer";
import { AppError } from "@/types";

const STROOP_CONVERSION_FACTOR = 10000000;

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
      const passphrase = (await rpcServer.getNetwork()).passphrase;
      let network: Networks;
      if (passphrase === Networks.PUBLIC) {
        network = Networks.PUBLIC;
      } else if (passphrase === Networks.TESTNET) {
        network = Networks.TESTNET;
      } else {
        network = Networks.FUTURENET;
      }

      // For now, we only support native XLM balance in embedded wallets
      const asset = Asset.native();

      try {
        const balance = await rpcServer.getSACBalance(contractAddress, asset, network);

        const balanceAmount = balance?.balanceEntry?.amount
          ? (Number(balance.balanceEntry.amount) / STROOP_CONVERSION_FACTOR).toString()
          : "0";

        return {
          asset_code: "XLM",
          balance: balanceAmount,
        };
      } catch (error) {
        console.error("Error fetching wallet balance:", error);
        // Return zero balance if fetching fails
        return {
          asset_code: "XLM",
          balance: "0",
        };
      }
    },
    enabled: Boolean(contractAddress),
    refetchInterval: 10000,
  });

  return query;
};
