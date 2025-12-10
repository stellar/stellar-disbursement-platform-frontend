import { getRequiredTomlInfo } from "../getRequiredTomlInfo";

import { handleApiResponse } from "@/api/handleApiResponse";

export type Sep24InteractiveDepositDetails = {
  url: string;
  txId: string;
};

const SEP24_REQUIRED_TOML_FIELDS = ["TRANSFER_SERVER_SEP0024"] as const;

const isNativeAsset = (assetCode: string) => ["XLM", "NATIVE"].includes(assetCode.toUpperCase());

export const depositWithSep24 = async (
  assetCode: string,
  contractAddress: string,
  lang: string,
  token: string,
): Promise<Sep24InteractiveDepositDetails> => {
  const tomlValues = await getRequiredTomlInfo(SEP24_REQUIRED_TOML_FIELDS);

  const params = new URLSearchParams({
    account: contractAddress,
    asset_code: isNativeAsset(assetCode) ? "native" : assetCode,
    lang: lang,
  });

  const response = await fetch(
    `${tomlValues.TRANSFER_SERVER_SEP0024}/transactions/deposit/interactive`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Bearer ${token}`,
      },
      body: params.toString(),
    },
  );

  const interactiveResponse = await handleApiResponse(response);
  if (!interactiveResponse?.url) {
    throw new Error("No URL returned from POST `/transactions/deposit/interactive`");
  }

  return {
    url: interactiveResponse.url,
    txId: interactiveResponse.id,
  };
};
