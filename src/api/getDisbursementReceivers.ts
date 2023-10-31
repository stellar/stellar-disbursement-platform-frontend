import { handleApiResponse } from "api/handleApiResponse";
import { handleSearchParams } from "api/handleSearchParams";
import { API_URL } from "constants/settings";
import { getSdpTenantName } from "helpers/getSdpTenantName";
import { ApiDisbursementReceivers, PaginationParams } from "types";

export const getDisbursementReceivers = async (
  token: string,
  disbursementId: string,
  searchParams?: PaginationParams,
): Promise<ApiDisbursementReceivers> => {
  const params = handleSearchParams(searchParams);

  const response = await fetch(
    `${API_URL}/disbursements/${disbursementId}/receivers${params}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        SDP_TENANT_NAME: getSdpTenantName(),
      },
    },
  );

  return handleApiResponse(response);
};
