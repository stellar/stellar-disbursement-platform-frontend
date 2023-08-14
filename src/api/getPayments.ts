import { handleApiResponse } from "api/handleApiResponse";
import { handleSearchParams } from "api/handleSearchParams";
import { API_URL } from "constants/settings";
import { ApiPayments, PaymentsSearchParams } from "types";

export const getPayments = async (
  token: string,
  searchParams?: PaymentsSearchParams,
): Promise<ApiPayments> => {
  // ALL status is for UI only
  if (searchParams?.status === "ALL") {
    delete searchParams.status;
  }

  const params = handleSearchParams(searchParams);

  const response = await fetch(`${API_URL}/payments${params}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return handleApiResponse(response);
};
