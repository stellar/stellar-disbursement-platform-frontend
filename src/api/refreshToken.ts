import { differenceInMinutes, fromUnixTime } from "date-fns";
import { API_URL } from "constants/envVariables";
import { SESSION_EXPIRED } from "constants/settings";
import { parseJwt } from "helpers/parseJwt";
import { getSdpTenantName } from "helpers/getSdpTenantName";

const MIN_MINUTES_FOR_REFRESH = 5;

export const refreshToken = async (token: string): Promise<string> => {
  const jwt = parseJwt(token);
  // JWT session is 15 min
  const minRemaining = differenceInMinutes(fromUnixTime(jwt.exp), Date.now());

  if (minRemaining <= 0) {
    throw SESSION_EXPIRED;
  } else if (minRemaining < MIN_MINUTES_FOR_REFRESH) {
    const response = await fetch(`${API_URL}/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "SDP-Tenant-Name": getSdpTenantName(),
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
