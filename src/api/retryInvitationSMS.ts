import { handleApiResponse } from "api/handleApiResponse";
import { API_URL } from "constants/settings";

export const retryInvitationSMS = async (
  token: string,
  receiverWalletId: string,
): Promise<{ message: string }> => {
  const response = await fetch(
    `${API_URL}/receivers/wallets/${receiverWalletId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return handleApiResponse(response);
};
