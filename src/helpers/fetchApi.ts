import { differenceInMinutes, fromUnixTime } from "date-fns";
import { refreshToken } from "api/refreshToken";
import { SESSION_EXPIRED_EVENT } from "constants/settings";
import { localStorageSessionToken } from "helpers/localStorageSessionToken";
import { parseJwt } from "helpers/parseJwt";
import { normalizeApiError } from "helpers/normalizeApiError";
import { AnyObject } from "types";
import { getSdpTenantName } from "./getSdpTenantName";

type FetchApiOptions = {
  withoutAuth?: boolean;
  omitContentType?: boolean;
  customCallback?: (request: Response) => void;
  organizationName?: string;
};

export const fetchApi = async (
  fetchUrl: string,
  fetchOptions?: RequestInit,
  options?: FetchApiOptions,
) => {
  const config = { ...fetchOptions };

  // Handle session token if auth is required
  if (!options?.withoutAuth) {
    let token = localStorageSessionToken.get();

    // No need to continue if there is no token
    if (!token) {
      return;
    }

    const jwt = parseJwt(token);
    // JWT session is 15 min
    const minRemaining = differenceInMinutes(fromUnixTime(jwt.exp), Date.now());

    if (minRemaining <= 0) {
      sessionExpired();
    } else if (minRemaining < 5) {
      token = await refreshToken(token);
      localStorageSessionToken.set(token);
    }

    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
      "SDP-Tenant-Name": getSdpTenantName(options?.organizationName),
      ...(!options?.omitContentType
        ? {
            "Content-Type":
              (config?.headers as AnyObject)?.["Content-Type"] ??
              "application/json",
          }
        : {}),
    };
  }

  // Handle initial request
  const request = await fetch(fetchUrl, config);

  if (options?.customCallback) {
    return options.customCallback(request);
  }

  if (request.status === 401) {
    sessionExpired();
  }

  const response = await request.json();

  if (response?.error) {
    throw normalizeApiError(response);
  }

  return response;
};

function sessionExpired() {
  document.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
  return;
}
