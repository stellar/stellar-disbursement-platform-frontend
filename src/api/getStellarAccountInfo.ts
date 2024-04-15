import { HORIZON_URL } from "constants/envVariables";
import { ApiStellarAccount } from "types";

export const getStellarAccountInfo = async (
  stellarAddress: string,
): Promise<ApiStellarAccount> => {
  const response = await fetch(`${HORIZON_URL}/accounts/${stellarAddress}`, {
    method: "GET",
  });

  if (response.status === 404) {
    throw `${stellarAddress} address was not found.`;
  }

  return await response.json();
};
