import { differenceInMinutes, fromUnixTime } from "date-fns";
import { API_URL, SESSION_EXPIRED } from "constants/settings";
import { parseJwt } from "helpers/parseJwt";
import { getSdpTenantName } from "helpers/getSdpTenantName";

export const refreshToken = async (token: string): Promise<string> => {
  const jwt = parseJwt(token);
  // JWT session is 15 min
  const minRemaining = differenceInMinutes(fromUnixTime(jwt.exp), Date.now());

  if (minRemaining <= 0) {
    throw SESSION_EXPIRED;
  } else if (minRemaining < 5) {
    const response = await fetch(`${API_URL}/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        SDP_TENANT_NAME: getSdpTenantName(),
      },
    });

    const responseJson = await response.json();

    if (responseJson.token) {
      return responseJson.token;
    }

    throw responseJson;
  }

  // Return current token
  return token;
};
