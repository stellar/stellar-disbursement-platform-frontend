import { handleApiResponse } from "api/handleApiResponse";
import { API_URL } from "constants/settings";
import { ApiCountry } from "types";

export const getCountries = async (token: string): Promise<ApiCountry[]> => {
  const response = await fetch(`${API_URL}/countries`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return handleApiResponse(response);
};
