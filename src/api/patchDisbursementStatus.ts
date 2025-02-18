import { handleApiResponse } from "api/handleApiResponse";
import { API_URL } from "constants/envVariables";
import { getSdpTenantName } from "helpers/getSdpTenantName";
import { DisbursementStatusType } from "types";

export const patchDisbursementStatus = async (
  token: string,
  disbursementId: string,
  status: DisbursementStatusType,
): Promise<{ message: string }> => {
  const response = await fetch(
    `${API_URL}/disbursements/${disbursementId}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "SDP-Tenant-Name": getSdpTenantName(),
      },
      body: JSON.stringify({
        status,
      }),
    },
  );

  return handleApiResponse(response);
};
