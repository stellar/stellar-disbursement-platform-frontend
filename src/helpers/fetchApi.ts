import { differenceInMinutes, fromUnixTime } from "date-fns";

import { SESSION_EXPIRED_EVENT } from "@/constants/settings";

import { refreshToken } from "@/api/refreshToken";

import { getSdpTenantName } from "@/helpers/getSdpTenantName";
import { getScopedWalletId } from "@/helpers/localStorageSelectedWallet";
import { localStorageSessionToken } from "@/helpers/localStorageSessionToken";
import { normalizeApiError } from "@/helpers/normalizeApiError";
import { parseJwt } from "@/helpers/parseJwt";

import { AnyObject, ApiError } from "@/types";

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

    const selectedWalletId = getScopedWalletId();

    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
      "SDP-Tenant-Name": getSdpTenantName(options?.organizationName),
      // Multi-wallet: scope requests to the selected distribution wallet ("all"/none omits it).
      ...(selectedWalletId ? { "X-Wallet-Id": selectedWalletId } : {}),
      ...(!options?.omitContentType
        ? {
            "Content-Type": (config?.headers as AnyObject)?.["Content-Type"] ?? "application/json",
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

  // Parse defensively: proxy error pages (502/504 on cold starts) are HTML, not JSON, and a
  // raw "Unexpected token" SyntaxError must never reach the operator. `any` preserves the
  // pre-existing request.json() contract (callers annotate their own response types).
  let response: any = null;
  const bodyText = await request.text();
  if (bodyText) {
    try {
      response = JSON.parse(bodyText);
    } catch {
      response = null;
    }
  }

  if (response?.error) {
    throw normalizeApiError(response as ApiError);
  }

  // A non-2xx response without a parseable {error} body (e.g. a gateway 502 page, or JSON in
  // an unexpected shape) must fail — previously it fell through and was treated as success.
  if (!request.ok) {
    if (response) {
      throw normalizeApiError(
        response as ApiError,
        `The request failed (HTTP ${request.status}). Please try again.`,
      );
    }
    throw normalizeApiError({
      error: `The server returned an unexpected response (HTTP ${request.status}). Please try again.`,
    } as ApiError);
  }

  return response;
};

function sessionExpired() {
  document.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
  return;
}
