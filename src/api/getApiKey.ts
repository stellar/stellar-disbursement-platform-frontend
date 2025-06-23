import { handleApiResponse } from "api/handleApiResponse";
import { API_URL } from "constants/envVariables";
import { getSdpTenantName } from "helpers/getSdpTenantName";
import { ApiKey } from "types";

export const getApiKey = async (
  token: string,
  apiKeyId: string,
): Promise<ApiKey> => {
  const response = await fetch(`${API_URL}/api-keys/${apiKeyId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "SDP-Tenant-Name": getSdpTenantName(),
    },
  });

  return handleApiResponse(response);
};
