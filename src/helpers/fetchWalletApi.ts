import { differenceInMinutes, fromUnixTime } from "date-fns";

import { handleApiResponse } from "@/api/handleApiResponse";
import { SESSION_EXPIRED, WALLET_SESSION_EXPIRED_EVENT } from "@/constants/settings";
import { getSdpTenantName } from "@/helpers/getSdpTenantName";
import { localStorageWalletSessionToken } from "@/helpers/localStorageWalletSessionToken";
import { parseJwt } from "@/helpers/parseJwt";

export const fetchWalletApi = async <ResponseType>(
  fetchUrl: string,
  fetchOptions?: RequestInit,
): Promise<ResponseType> => {
  const token = localStorageWalletSessionToken.get();

  if (!token) {
    document.dispatchEvent(new CustomEvent(WALLET_SESSION_EXPIRED_EVENT));
    throw new Error(SESSION_EXPIRED);
  }

  const jwt = parseJwt(token);
  const minRemaining = differenceInMinutes(fromUnixTime(jwt.exp), Date.now());

  if (minRemaining <= 0) {
    document.dispatchEvent(new CustomEvent(WALLET_SESSION_EXPIRED_EVENT));
    throw new Error(SESSION_EXPIRED);
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    "SDP-Tenant-Name": getSdpTenantName(),
    ...((fetchOptions?.headers as Record<string, string> | undefined) ?? {}),
  };

  const response = await fetch(fetchUrl, {
    ...fetchOptions,
    headers,
  });

  if (response.status === 401) {
    document.dispatchEvent(new CustomEvent(WALLET_SESSION_EXPIRED_EVENT));
    throw new Error(SESSION_EXPIRED);
  }

  return (await handleApiResponse(response)) as ResponseType;
};
