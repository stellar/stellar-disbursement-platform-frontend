import { rpc } from "@stellar/stellar-sdk";

import { API_URL } from "@/constants/envVariables";

import { getSdpTenantName } from "@/helpers/getSdpTenantName";
import { localStorageSessionToken } from "@/helpers/localStorageSessionToken";
import { localStorageWalletSessionToken } from "@/helpers/localStorageWalletSessionToken";

export type RpcAuthType = "user" | "wallet";

export const createAuthenticatedRpcServer = (
  authType: RpcAuthType,
  organizationName?: string,
): rpc.Server => {
  const token =
    authType === "wallet" ? localStorageWalletSessionToken.get() : localStorageSessionToken.get();

  if (!token) {
    throw new Error("Authentication required for RPC requests");
  }

  const rpcProxyUrl = `${API_URL}/rpc/${authType}`;

  const isHttpUrl = new URL(rpcProxyUrl).protocol === "http:";
  return new rpc.Server(rpcProxyUrl, {
    allowHttp: isHttpUrl,
    headers: {
      Authorization: `Bearer ${token}`,
      "SDP-Tenant-Name": getSdpTenantName(organizationName),
    },
  });
};
