import { handleApiResponse } from "api/handleApiResponse";
import { API_URL } from "constants/envVariables";
import { UI_STATUS_DISBURSEMENT_DRAFT } from "constants/settings";
import { getSdpTenantName } from "helpers/getSdpTenantName";
import { ApiDisbursements } from "types";

export const getDisbursementDrafts = async (
  token: string,
): Promise<ApiDisbursements> => {
  // TODO: Max page limit is 100. We will need to implement pagination for more
  const response = await fetch(
    `${API_URL}/disbursements?status=${UI_STATUS_DISBURSEMENT_DRAFT}&page_limit=100`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "SDP-Tenant-Name": getSdpTenantName(),
      },
    },
  );

  return handleApiResponse(response);
};
