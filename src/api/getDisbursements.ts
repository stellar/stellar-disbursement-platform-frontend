import { API_URL } from "@/constants/envVariables";
import { UI_STATUS_DISBURSEMENT } from "@/constants/settings";

import { handleApiResponse } from "@/api/handleApiResponse";
import { handleSearchParams } from "@/api/handleSearchParams";

import { getSdpTenantName } from "@/helpers/getSdpTenantName";
import { walletIdHeader } from "@/helpers/walletIdHeader";

import { ApiDisbursements, PaymentsSearchParams } from "@/types";

export const getDisbursements = async (
  token: string,
  searchParams?: PaymentsSearchParams,
  walletId?: string,
): Promise<ApiDisbursements> => {
  // ALL status is for UI only
  if (searchParams?.status === "ALL") {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { status, ...searchParamsWithoutStatus } = searchParams;
    searchParams = searchParamsWithoutStatus;
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
      "SDP-Tenant-Name": getSdpTenantName(),
      // Multi-wallet: scope the list to the distribution account the caller is showing.
      ...walletIdHeader(walletId),
    },
  });

  return handleApiResponse(response);
};
