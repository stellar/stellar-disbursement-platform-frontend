import { handleApiResponse } from "api/handleApiResponse";
import { API_URL } from "constants/settings";

export const postForgotPassword = async (
  email: string,
  recaptchaToken: string,
): Promise<{ message: string }> => {
  const response = await fetch(`${API_URL}/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      recaptcha_token: recaptchaToken,
    }),
  });

  return handleApiResponse(response);
};
