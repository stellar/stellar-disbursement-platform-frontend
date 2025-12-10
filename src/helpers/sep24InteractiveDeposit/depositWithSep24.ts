import { getRequiredTomlInfo } from "../getRequiredTomlInfo";

import { getTransactionStatus } from "@/api/getTransactionStatus";
import { handleApiResponse } from "@/api/handleApiResponse";

const SEP24_REQUIRED_TOML_FIELDS = ["TRANSFER_SERVER_SEP0024"] as const;
const SUCCESS_STATUS = "completed";
const ERROR_STATUS = "error";
const POLL_INTERVAL_MS = 2000;

const isNativeAsset = (assetCode: string) => ["XLM", "NATIVE"].includes(assetCode.toUpperCase());

const openVerificationPopup = (url: string): void => {
  if (typeof window === "undefined") {
    return;
  }

  window.open(url, "_blank", "noopener,noreferrer");
};

const pollTransactionUntilComplete = async ({
  transferServerUrl,
  transactionId,
  token,
}: {
  transferServerUrl: string;
  transactionId: string;
  token: string;
}): Promise<string> => {
  let status = await getTransactionStatus({
    transferServerUrl,
    transactionId,
    token,
  });

  while (true) {
    if (status === SUCCESS_STATUS) {
      return status;
    }

    if (status === ERROR_STATUS) {
      throw new Error("SEP-24 verification failed");
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    status = await getTransactionStatus({
      transferServerUrl,
      transactionId,
      token,
    });
  }
};

export const depositWithSep24 = async (
  assetCode: string,
  contractAddress: string,
  token: string,
): Promise<string> => {
  const tomlValues = await getRequiredTomlInfo(SEP24_REQUIRED_TOML_FIELDS);

  const params = new URLSearchParams({
    account: contractAddress,
    asset_code: isNativeAsset(assetCode) ? "native" : assetCode,
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

  openVerificationPopup(interactiveResponse.url);
  const status = await pollTransactionUntilComplete({
    transferServerUrl: tomlValues.TRANSFER_SERVER_SEP0024,
    transactionId: interactiveResponse.id,
    token,
  });

  return status;
};
