import { handleApiResponse } from "api/handleApiResponse";
import { API_URL } from "constants/settings";
import { ApiAsset } from "types";

export const postAssets = async (
  token: string,
  asset: {
    code: string;
    issuer: string;
  },
): Promise<ApiAsset> => {
  const response = await fetch(`${API_URL}/assets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      code: asset.code,
      issuer: asset.issuer,
    }),
  });

  return handleApiResponse(response);
};
