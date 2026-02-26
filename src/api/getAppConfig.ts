import { API_URL } from "@/constants/envVariables";

import { getSdpTenantName } from "@/helpers/getSdpTenantName";

export type AppConfig = {
  captcha_type: string;
  captcha_disabled: boolean;
  captcha_site_key: string;
};

export const getAppConfig = async (): Promise<AppConfig> => {
  const response = await fetch(`${API_URL}/app-config`, {
    headers: {
      "SDP-Tenant-Name": getSdpTenantName(),
    },
  });

  const responseJson = await response.json();

  if (responseJson.error) {
    throw responseJson;
  }

  return responseJson;
};
