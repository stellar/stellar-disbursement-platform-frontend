import { handleApiResponse } from "api/handleApiResponse";
import { API_URL } from "constants/settings";
import { ApiAsset } from "types";

export const deleteAsset = async (
  token: string,
  assetId: string,
): Promise<ApiAsset> => {
  const response = await fetch(`${API_URL}/assets/${assetId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return handleApiResponse(response);
};
