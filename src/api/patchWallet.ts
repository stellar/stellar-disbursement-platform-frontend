import { handleApiResponse } from "api/handleApiResponse";
import { API_URL } from "constants/settings";

export const patchWallet = async (
  token: string,
  walletId: string,
  enabled: boolean,
): Promise<{ message: string }> => {
  const response = await fetch(`${API_URL}/wallets/${walletId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      enabled,
    }),
  });

  return handleApiResponse(response);
};
