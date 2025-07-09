import { API_URL } from "constants/envVariables";
import { SESSION_EXPIRED } from "constants/settings";
import { getSdpTenantName } from "helpers/getSdpTenantName";

export const deleteApiKey = async (
  token: string,
  apiKeyId: string,
): Promise<{ message: string }> => {
  const response = await fetch(`${API_URL}/api-keys/${apiKeyId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "SDP-Tenant-Name": getSdpTenantName(),
    },
  });

  if (response.status === 401) {
    throw SESSION_EXPIRED;
  }

  if (response.status === 204) {
    return { message: "API key deleted successfully" };
  }

  throw new Error(`Failed to delete API key: ${response.status}`);
};
