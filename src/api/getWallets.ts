import { handleApiResponse } from "api/handleApiResponse";
import { API_URL } from "constants/settings";
import { ApiWallet } from "types";

export const getWallets = async (token: string): Promise<ApiWallet[]> => {
  const response = await fetch(`${API_URL}/wallets`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return handleApiResponse(response);
};
