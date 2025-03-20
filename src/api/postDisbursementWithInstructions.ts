import { handleApiResponse } from "api/handleApiResponse";
import { API_URL } from "constants/envVariables";
import { getSdpTenantName } from "helpers/getSdpTenantName";
import { ApiDisbursement, Disbursement } from "types";
import { preparePostDisbursementData } from "./postDisbursement";

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
    },
    body: formData,
  });

  return handleApiResponse(response);
};
