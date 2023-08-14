import { handleApiResponse } from "api/handleApiResponse";
import { API_URL } from "constants/settings";

export const patchUserStatus = async (
  token: string,
  userId: string,
  isActive: boolean,
): Promise<{ message: string }> => {
  const response = await fetch(`${API_URL}/users/activation`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      user_id: userId,
      is_active: isActive,
    }),
  });

  return handleApiResponse(response);
};
