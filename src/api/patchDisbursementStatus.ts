import { handleApiResponse } from "api/handleApiResponse";
import { API_URL } from "constants/settings";
import { DisbursementStatus } from "types";

export const patchDisbursementStatus = async (
  token: string,
  disbursementId: string,
  status: DisbursementStatus,
): Promise<{ message: string }> => {
  const response = await fetch(
    `${API_URL}/disbursements/${disbursementId}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        status,
      }),
    },
  );

  return handleApiResponse(response);
};
