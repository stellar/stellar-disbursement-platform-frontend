import { handleApiResponse } from "api/handleApiResponse";
import { handleSearchParams } from "api/handleSearchParams";
import { API_URL, UI_STATUS_DISBURSEMENT } from "constants/settings";
import { getSdpTenantName } from "helpers/getSdpTenantName";
import { ApiDisbursements, PaymentsSearchParams } from "types";

export const getDisbursements = async (
  token: string,
  searchParams?: PaymentsSearchParams,
): Promise<ApiDisbursements> => {
  // ALL status is for UI only
  if (searchParams?.status === "ALL") {
    delete searchParams.status;
  }

  const params = handleSearchParams({
    status: UI_STATUS_DISBURSEMENT,
    ...searchParams,
  });

  const response = await fetch(`${API_URL}/disbursements${params}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      SDP_TENANT_NAME: getSdpTenantName(),
    },
  });

  return handleApiResponse(response);
};
