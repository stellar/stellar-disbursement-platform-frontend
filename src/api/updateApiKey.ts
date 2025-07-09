import { API_URL } from "constants/envVariables";
import { SESSION_EXPIRED } from "constants/settings";
import { getSdpTenantName } from "helpers/getSdpTenantName";

export interface UpdateApiKeyRequest {
  permissions: string[];
  allowed_ips?: string[] | null;
}

export const updateApiKey = async (
  token: string,
  apiKeyId: string,
  updateData: UpdateApiKeyRequest,
): Promise<{ message: string }> => {
  const response = await fetch(`${API_URL}/api-keys/${apiKeyId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "SDP-Tenant-Name": getSdpTenantName(),
    },
    body: JSON.stringify(updateData),
  });

  if (response.status === 401) {
    throw SESSION_EXPIRED;
  }

  if (response.status === 200) {
    return { message: "API key updated successfully" };
  }

  throw new Error(`Failed to update API key: ${response.status}`);
};
