import { handleApiResponse } from "@/api/handleApiResponse";
import { API_URL } from "@/constants/envVariables";
import { getSdpTenantName } from "@/helpers/getSdpTenantName";
import type { ApiAsset } from "@/types";

export interface PasskeyRefreshRequest {
  token: string;
}

export interface PasskeyRefreshResponse {
  token: string;
  is_verification_pending: boolean;
  pending_asset?: ApiAsset;
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

  return handleApiResponse(response);
};
