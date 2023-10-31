import { handleApiResponse } from "api/handleApiResponse";
import { API_URL } from "constants/settings";
import { getSdpTenantName } from "helpers/getSdpTenantName";
import { ApiProfileInfo } from "types";

export const getProfileInfo = async (
  token: string,
): Promise<ApiProfileInfo> => {
  const response = await fetch(`${API_URL}/profile`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      SDP_TENANT_NAME: getSdpTenantName(),
    },
  });

  return handleApiResponse(response);
};
