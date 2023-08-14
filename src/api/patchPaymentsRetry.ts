import { handleApiResponse } from "api/handleApiResponse";
import { API_URL } from "constants/settings";

export const patchPaymentsRetry = async (
  token: string,
  paymentIds: string[],
): Promise<{ message: string }> => {
  const response = await fetch(`${API_URL}/payments/retry`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      payment_ids: paymentIds,
    }),
  });

  return handleApiResponse(response);
};
