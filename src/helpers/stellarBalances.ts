import { Asset, Networks, rpc } from "@stellar/stellar-sdk";
import BigNumber from "bignumber.js";

import { ApiStellarAccountBalance } from "@/types";

const STROOP_CONVERSION_FACTOR = new BigNumber("10000000");

type AssetDescriptor = {
  code: string;
  issuer: string | null;
};

type FetchSACBalancesParams = {
  rpcServer: rpc.Server;
  stellarAddress: string;
  assets: AssetDescriptor[];
  network?: Networks;
};

export const fetchSACBalances = async ({
  rpcServer,
  stellarAddress,
  assets,
  network,
}: FetchSACBalancesParams): Promise<ApiStellarAccountBalance[]> => {
  if (!assets.length) {
    return [];
  }

  let resolvedNetwork = network;
  if (!resolvedNetwork) {
    const passphrase = (await rpcServer.getNetwork())?.passphrase;
    if (passphrase === Networks.PUBLIC) {
      resolvedNetwork = Networks.PUBLIC;
    } else if (passphrase === Networks.FUTURENET) {
      resolvedNetwork = Networks.FUTURENET;
    } else {
      resolvedNetwork = Networks.TESTNET;
    }
  }

  return Promise.all(
    assets.map(async ({ code, issuer }) => {
      const asset = code === "XLM" ? Asset.native() : new Asset(code, issuer ?? "");
      let balanceAmount = "0";

      try {
        const balance = await rpcServer.getSACBalance(stellarAddress, asset, resolvedNetwork);
        const amount = balance?.balanceEntry?.amount;

        if (amount) {
          balanceAmount = new BigNumber(amount).dividedBy(STROOP_CONVERSION_FACTOR).toString(10);
        }
      } catch {
        // If fetching balance fails, default to "0"
      }

      return {
        asset_code: code,
        asset_issuer: issuer ?? undefined,
        asset_type: asset.getAssetType(),
        balance: balanceAmount,
      };
    }),
  );
};
