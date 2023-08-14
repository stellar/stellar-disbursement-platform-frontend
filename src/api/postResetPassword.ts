import { handleApiResponse } from "api/handleApiResponse";
import { API_URL } from "constants/settings";

export const postResetPassword = async (
  password: string,
  resetToken: string,
): Promise<boolean> => {
  const response = await fetch(`${API_URL}/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      // TODO: decode password before sending when BE is ready
      password,
      reset_token: resetToken,
    }),
  });

  if (response.status === 200) {
    return true;
  } else {
    return handleApiResponse(response);
  }
};
