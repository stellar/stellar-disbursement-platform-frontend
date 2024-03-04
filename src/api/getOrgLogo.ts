import { API_URL } from "constants/envVariables";
import { getSdpTenantName } from "helpers/getSdpTenantName";

export async function getOrgLogo(token: string): Promise<string> {
  const response = await fetch(`${API_URL}/organization/logo`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "SDP-Tenant-Name": getSdpTenantName(),
    },
  });

  const responseBlob = await response.blob();
  return URL.createObjectURL(responseBlob);
}
