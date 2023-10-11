import { handleApiResponse } from "api/handleApiResponse";
import { API_URL } from "constants/settings";
import { ApiAsset } from "types";

export const getAssetsByWallet = async (
  token: string,
  walletId: string,
): Promise<ApiAsset[]> => {
  const response = await fetch(`${API_URL}/assets?wallet=${walletId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return handleApiResponse(response);
};
