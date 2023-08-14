import { API_URL, SESSION_EXPIRED } from "constants/settings";

export const getDisbursementInstructions = async (
  token: string,
  disbursementId: string,
): Promise<Blob> => {
  const response = await fetch(
    `${API_URL}/disbursements/${disbursementId}/instructions`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (response.status === 401) {
    throw SESSION_EXPIRED;
  }

  return await response.blob();
};
