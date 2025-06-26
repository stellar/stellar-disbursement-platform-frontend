import { handleApiResponse } from "api/handleApiResponse";
import { handleSearchParams } from "api/handleSearchParams";
import { API_URL } from "constants/envVariables";
import { getSdpTenantName } from "helpers/getSdpTenantName";
import { ApiReceivers } from "types";

export const searchReceivers = async (
  token: string,
  searchQuery: string,
  pageLimit: number = 20,
): Promise<ApiReceivers> => {
  const params = handleSearchParams({
    q: searchQuery,
    page: "1",
    page_limit: pageLimit.toString(),
  });

  const response = await fetch(`${API_URL}/receivers${params}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "SDP-Tenant-Name": getSdpTenantName(),
    },
  });

  return handleApiResponse(response);
};
