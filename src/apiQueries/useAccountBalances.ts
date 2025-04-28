import { useQuery } from "@tanstack/react-query";
import { Asset, Networks, rpc } from "@stellar/stellar-sdk";
import { API_URL, HORIZON_URL, RPC_URL } from "constants/envVariables";
import { fetchApi } from "helpers/fetchApi";
import { fetchStellarApi } from "helpers/fetchStellarApi";
import { ApiStellarAccountBalance, AppError } from "types";

const STROOP_CONVERSION_FACTOR = 10000000;

interface ApiAsset {
  id: string;
  code: string;
  issuer: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

const getKnownBalances = async (
  rpcServer: rpc.Server,
  stellarAddress: string,
  apiAsset: ApiAsset,
  network: Networks,
): Promise<ApiStellarAccountBalance> => {
  const asset =
    apiAsset.code === "XLM"
      ? Asset.native()
      : new Asset(apiAsset.code, apiAsset.issuer);

  try {
    const balance = await rpcServer.getSACBalance(
      stellarAddress,
      asset,
      network,
    );

    const balanceAmount = balance?.balanceEntry?.amount
      ? (
          Number(balance.balanceEntry.amount) / STROOP_CONVERSION_FACTOR
        ).toString()
      : "0";

    return {
      asset_code: apiAsset.code,
      asset_issuer: apiAsset.issuer,
      asset_type: asset.getAssetType(),
      balance: balanceAmount,
    };
  } catch {
    // Return zero balance if fetching fails for a specific asset
    return {
      asset_code: apiAsset.code,
      asset_issuer: apiAsset.issuer,
      asset_type: asset.getAssetType(),
      balance: "0",
    };
  }
};

export const useAccountBalances = (stellarAddress: string | undefined) => {
  const query = useQuery<ApiStellarAccountBalance[], AppError>({
    queryKey: ["account-balances", stellarAddress],
    queryFn: async () => {
      if (!stellarAddress) {
        throw new Error("stellarAddress is required");
      }

      if (stellarAddress.startsWith("G")) {
        const accountInfo = await fetchStellarApi(
          `${HORIZON_URL}/accounts/${stellarAddress}`,
          undefined,
          {
            notFoundMessage: `${stellarAddress} address was not found.`,
          },
        );
        return accountInfo?.balances ?? [];
      } else {
        if (!RPC_URL || !API_URL) {
          throw new Error("RPC_URL and API_URL are required for SAC balances");
        }

        const assetsUrl = new URL(`${API_URL}/assets`);
        const assets: ApiAsset[] = await fetchApi(assetsUrl.toString());

        const rpcServer = new rpc.Server(RPC_URL);
        const passphrase = (await rpcServer.getNetwork()).passphrase;
        let network: Networks;
        if (passphrase === Networks.PUBLIC) {
          network = Networks.PUBLIC;
        } else if (passphrase === Networks.TESTNET) {
          network = Networks.TESTNET;
        } else {
          network = Networks.TESTNET;
        }

        const balancePromises = assets.map((apiAsset) =>
          getKnownBalances(rpcServer, stellarAddress, apiAsset, network),
        );

        return await Promise.all(balancePromises);
      }
    },
    enabled:
      Boolean(stellarAddress) &&
      (stellarAddress!.startsWith("G")
        ? Boolean(HORIZON_URL)
        : Boolean(RPC_URL) && Boolean(API_URL)),
  });

  return query;
};
