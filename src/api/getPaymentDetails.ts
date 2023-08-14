import { handleApiResponse } from "api/handleApiResponse";
import { API_URL } from "constants/settings";
import { ApiPayment } from "types";

export const getPaymentDetails = async (
  token: string,
  paymentId: string,
): Promise<ApiPayment> => {
  const response = await fetch(`${API_URL}/payments/${paymentId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return handleApiResponse(response);
};
