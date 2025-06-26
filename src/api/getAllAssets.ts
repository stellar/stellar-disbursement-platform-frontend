import { handleApiResponse } from "api/handleApiResponse";
import { API_URL } from "constants/envVariables";
import { getSdpTenantName } from "helpers/getSdpTenantName";
import { ApiAsset } from "types";

export const getAllAssets = async (token: string): Promise<ApiAsset[]> => {
  const response = await fetch(`${API_URL}/assets`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "SDP-Tenant-Name": getSdpTenantName(),
    },
  });

  return handleApiResponse(response);
};
