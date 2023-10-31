import { handleApiResponse } from "api/handleApiResponse";
import { API_URL } from "constants/settings";
import { getSdpTenantName } from "helpers/getSdpTenantName";
import { ApiOrgInfo } from "types";

export const getOrgInfo = async (token: string): Promise<ApiOrgInfo> => {
  const response = await fetch(`${API_URL}/organization`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      SDP_TENANT_NAME: getSdpTenantName(),
    },
  });

  return handleApiResponse(response);
};
