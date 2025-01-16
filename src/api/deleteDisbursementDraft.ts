import { handleApiResponse } from "api/handleApiResponse";
import { API_URL } from "constants/envVariables";
import { getSdpTenantName } from "helpers/getSdpTenantName";
import { ApiDisbursement } from "types";

export const deleteDisbursementDraft = async (
  token: string,
  draftId: string,
): Promise<ApiDisbursement> => {
  const response = await fetch(`${API_URL}/disbursements/${draftId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "SDP-Tenant-Name": getSdpTenantName(),
    },
  });

  return handleApiResponse(response);
};
