import { handleApiResponse } from "api/handleApiResponse";
import { handleSearchParams } from "api/handleSearchParams";
import { API_URL } from "constants/settings";
import { ApiReceivers, ReceiversSearchParams } from "types";

export const getReceivers = async (
  token: string,
  searchParams?: ReceiversSearchParams,
): Promise<ApiReceivers> => {
  // ALL status is for UI only
  if (searchParams?.status === "ALL") {
    delete searchParams.status;
  }

  const params = handleSearchParams(searchParams);

  const response = await fetch(`${API_URL}/receivers${params}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return handleApiResponse(response);
};
