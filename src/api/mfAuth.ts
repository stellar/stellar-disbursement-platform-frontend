import { API_URL } from "constants/envVariables";

export const mfAuth = async (
  mfaCode: string,
  rememberMe: boolean,
  recaptchaToken: string,
  headers: Record<string, string>,
): Promise<string> => {
  const response = await fetch(`${API_URL}/mfa`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify({
      mfa_code: mfaCode,
      remember_me: rememberMe,
      recaptcha_token: recaptchaToken,
    }),
  });

  const responseJson = await response.json();

  return responseJson;
};
