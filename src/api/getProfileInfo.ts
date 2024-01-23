import { handleApiResponse } from "api/handleApiResponse";
import { API_URL } from "constants/envVariables";
import { ApiProfileInfo } from "types";

export const getProfileInfo = async (
  token: string,
): Promise<ApiProfileInfo> => {
  const response = await fetch(`${API_URL}/profile`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return handleApiResponse(response);
};
