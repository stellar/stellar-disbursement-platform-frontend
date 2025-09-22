import { SESSION_EXPIRED } from "@/constants/settings";
import { ApiError } from "@/types";

export const handleApiResponse = async (response: Response) => {
  if (response.status === 401) {
    throw SESSION_EXPIRED;
  }

  const responseJson = await response.json();

  if (responseJson.error) {
    throw responseJson as ApiError;
  }

  return responseJson;
};
