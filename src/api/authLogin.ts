import { API_URL } from "constants/envVariables";

export const authLogin = async (
  email: string,
  password: string,
  recaptchaToken: string,
  headers: Record<string, string>,
): Promise<string> => {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify({
      email,
      password,
      recaptcha_token: recaptchaToken,
    }),
  });

  const responseJson = await response.json();

  if (responseJson.error) {
    throw responseJson;
  }

  return responseJson;
};
