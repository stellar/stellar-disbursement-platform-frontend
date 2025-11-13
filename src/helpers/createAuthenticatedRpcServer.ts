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
    authType === "wallet"
      ? localStorageWalletSessionToken.get()?.token
      : localStorageSessionToken.get();

  if (!token) {
    throw new Error("Authentication required for RPC requests");
  }

  const rpcProxyUrl = `${API_URL}/rpc/${authType}`;

  const isDevelopment = process.env.NODE_ENV === "development";
  return new rpc.Server(rpcProxyUrl, {
    allowHttp: isDevelopment,
    headers: {
      Authorization: `Bearer ${token}`,
      "SDP-Tenant-Name": getSdpTenantName(organizationName),
    },
  });
};
