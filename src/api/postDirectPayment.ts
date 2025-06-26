import { handleApiResponse } from "api/handleApiResponse";
import { API_URL } from "constants/envVariables";
import { getSdpTenantName } from "helpers/getSdpTenantName";
import { ApiPayment, CreateDirectPaymentRequest } from "types";

export const postDirectPayment = async (
  token: string,
  paymentData: CreateDirectPaymentRequest,
): Promise<ApiPayment> => {
  const response = await fetch(`${API_URL}/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "SDP-Tenant-Name": getSdpTenantName(),
    },
    body: JSON.stringify(paymentData),
  });

  return handleApiResponse(response);
};
