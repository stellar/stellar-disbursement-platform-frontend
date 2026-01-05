import { handleWalletApiResponse } from "@/api/handleWalletApiResponse";
import { API_URL } from "@/constants/envVariables";
import { getSdpTenantName } from "@/helpers/getSdpTenantName";

export interface PasskeyRefreshRequest {
  token: string;
}

export interface PasskeyRefreshResponse {
  token: string;
}

export const refreshPasskeyToken = async (token: string): Promise<PasskeyRefreshResponse> => {
  const response = await fetch(`${API_URL}/embedded-wallets/passkey/authentication/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "SDP-Tenant-Name": getSdpTenantName(),
    },
    body: JSON.stringify({ token }),
  });

  return handleWalletApiResponse<PasskeyRefreshResponse>(response);
};
