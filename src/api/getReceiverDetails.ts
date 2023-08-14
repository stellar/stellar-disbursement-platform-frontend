import { handleApiResponse } from "api/handleApiResponse";
import { API_URL } from "constants/settings";
import { ApiReceiver } from "types";

export const getReceiverDetails = async (
  token: string,
  receiverId: string,
): Promise<ApiReceiver> => {
  const response = await fetch(`${API_URL}/receivers/${receiverId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return handleApiResponse(response);
};
