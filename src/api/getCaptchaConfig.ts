import { API_URL } from "@/constants/envVariables";

export type CaptchaConfig = {
  captcha_type: string;
  captcha_disabled: boolean;
};

export const getCaptchaConfig = async (organizationName: string): Promise<CaptchaConfig> => {
  const response = await fetch(
    `${API_URL}/organization/captcha-config?organization_name=${encodeURIComponent(organizationName)}`,
  );

  const responseJson = await response.json();

  if (responseJson.error) {
    throw responseJson;
  }

  return responseJson;
};
