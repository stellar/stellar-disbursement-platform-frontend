import { handleApiResponse } from "api/handleApiResponse";
import { API_URL } from "constants/settings";
import { ApiStatistics } from "types";

export const getStatistics = async (token: string): Promise<ApiStatistics> => {
  const response = await fetch(`${API_URL}/statistics`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return handleApiResponse(response);
};
