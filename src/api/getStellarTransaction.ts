import { HORIZON_URL } from "constants/envVariables";
import { shortenString } from "helpers/shortenString";
import { ApiStellarTransaction } from "types";

export const getStellarTransaction = async (
  transactionHash: string,
): Promise<ApiStellarTransaction> => {
  const response = await fetch(
    `${HORIZON_URL}/transactions/${transactionHash}`,
    {
      method: "GET",
    },
  );

  if (response.status === 404) {
    throw `${shortenString(transactionHash, 10)} transaction was not found.`;
  }

  return await response.json();
};
