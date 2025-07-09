import { handleApiResponse } from "api/handleApiResponse";
import { API_URL } from "constants/envVariables";
import { getSdpTenantName } from "helpers/getSdpTenantName";
import { ApiKey, CreateApiKeyRequest } from "types";

export const postApiKey = async (
  token: string,
  apiKeyData: CreateApiKeyRequest,
): Promise<ApiKey> => {
  const response = await fetch(`${API_URL}/api-keys`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "SDP-Tenant-Name": getSdpTenantName(),
    },
    body: JSON.stringify(apiKeyData),
  });

  return handleApiResponse(response);
};
