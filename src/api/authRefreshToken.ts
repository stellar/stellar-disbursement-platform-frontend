import { API_URL } from "constants/settings";

export const authRefreshToken = async (token: string): Promise<string> => {
  const response = await fetch(`${API_URL}/refresh-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const responseJson = await response.json();

  if (responseJson.token) {
    return responseJson.token;
  }

  throw responseJson;
};
