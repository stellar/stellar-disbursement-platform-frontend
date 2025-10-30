import { handleApiResponse } from "@/api/handleApiResponse";
import { SESSION_EXPIRED_EVENT } from "@/constants/settings";
import { getSdpTenantName } from "@/helpers/getSdpTenantName";
import { localStorageWalletSessionToken } from "@/helpers/localStorageWalletSessionToken";

export const fetchWalletApi = async <ResponseType>(
  fetchUrl: string,
  fetchOptions?: RequestInit,
): Promise<ResponseType> => {
  const token = localStorageWalletSessionToken.get();

  if (!token) {
    document.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
    return Promise.reject();
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
    document.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
    return Promise.reject();
  }

  return (await handleApiResponse(response)) as ResponseType;
};
