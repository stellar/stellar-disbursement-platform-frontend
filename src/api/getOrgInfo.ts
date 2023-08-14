import { handleApiResponse } from "api/handleApiResponse";
import { API_URL } from "constants/settings";
import { ApiOrgInfo } from "types";

export const getOrgInfo = async (token: string): Promise<ApiOrgInfo> => {
  const response = await fetch(`${API_URL}/organization`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return handleApiResponse(response);
};
