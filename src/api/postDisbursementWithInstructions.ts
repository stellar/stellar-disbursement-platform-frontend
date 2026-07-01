import { API_URL } from "@/constants/envVariables";

import { handleApiResponse } from "@/api/handleApiResponse";

import { getSdpTenantName } from "@/helpers/getSdpTenantName";
import { walletIdHeader } from "@/helpers/walletIdHeader";

import { preparePostDisbursementData } from "./postDisbursement";

import { ApiDisbursement, Disbursement } from "@/types";

export const postDisbursementWithInstructions = async (
  token: string,
  disbursement: Disbursement,
  file: File,
): Promise<ApiDisbursement> => {
  const formData = new FormData();

  const data = preparePostDisbursementData(disbursement);
  formData.append("data", JSON.stringify(data));
  formData.append("file", file);

  const response = await fetch(`${API_URL}/disbursements`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "SDP-Tenant-Name": getSdpTenantName(),
      // Multi-wallet: route this disbursement to the selected source account.
      ...walletIdHeader(),
    },
    body: formData,
  });

  return handleApiResponse(response);
};
