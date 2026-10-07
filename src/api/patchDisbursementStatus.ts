import { handleApiResponse } from "@/api/handleApiResponse";
import { API_URL } from "@/constants/envVariables";
import { getSdpTenantName } from "@/helpers/getSdpTenantName";
import { DisbursementStatusType } from "@/types";

export const patchDisbursementStatus = async (
  token: string,
  disbursementId: string,
  status: DisbursementStatusType,
  sourceWalletId?: string,
): Promise<{ message: string }> => {
  const response = await fetch(`${API_URL}/disbursements/${disbursementId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "SDP-Tenant-Name": getSdpTenantName(),
      // Multi-wallet: scope this write to the disbursement's OWN source account, not the ambient
      // ActiveWalletBar selection (walletIdHeader), which may have moved since the page loaded.
      ...(sourceWalletId ? { "X-Wallet-Id": sourceWalletId } : {}),
    },
    body: JSON.stringify({
      status,
    }),
  });

  return handleApiResponse(response);
};
