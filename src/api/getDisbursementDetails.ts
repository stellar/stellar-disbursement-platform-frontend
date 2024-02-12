import { handleApiResponse } from "api/handleApiResponse";
import { API_URL } from "constants/envVariables";
import { getSdpTenantName } from "helpers/getSdpTenantName";
import { ApiDisbursement } from "types";

export const getDisbursementDetails = async (
  token: string,
  disbursementId: string,
): Promise<ApiDisbursement> => {
  const response = await fetch(`${API_URL}/disbursements/${disbursementId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "SDP-Tenant-Name": getSdpTenantName(),
    },
  });

  return handleApiResponse(response);
};
