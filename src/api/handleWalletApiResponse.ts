import { WALLET_SESSION_EXPIRED } from "@/constants/settings";

import type { ApiError } from "@/types";

export const handleWalletApiResponse = async <ResponseType>(
  response: Response,
): Promise<ResponseType> => {
  if (response.status === 401) {
    throw WALLET_SESSION_EXPIRED;
  }

  const responseJson = await response.json();

  if (responseJson.error) {
    throw responseJson as ApiError;
  }

  return responseJson as ResponseType;
};
