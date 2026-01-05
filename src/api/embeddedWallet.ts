import { handleWalletApiResponse } from "@/api/handleWalletApiResponse";
import { API_URL } from "@/constants/envVariables";
import { getSdpTenantName } from "@/helpers/getSdpTenantName";
import type { EmbeddedWalletProfileResponse } from "@/types";

export type EmbeddedWalletStatus = "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED";

export interface CreateWalletRequest {
  token: string;
  public_key: string;
  credential_id: string;
}

export interface WalletResponse {
  contract_address: string;
  status: EmbeddedWalletStatus;
}

export const createEmbeddedWallet = async (
  request: CreateWalletRequest,
): Promise<WalletResponse> => {
  const response = await fetch(`${API_URL}/embedded-wallets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "SDP-Tenant-Name": getSdpTenantName(),
    },
    body: JSON.stringify(request),
  });

  return handleWalletApiResponse<WalletResponse>(response);
};

export const getWalletStatus = async (credentialId: string): Promise<WalletResponse> => {
  const response = await fetch(`${API_URL}/embedded-wallets/${encodeURIComponent(credentialId)}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "SDP-Tenant-Name": getSdpTenantName(),
    },
  });

  return handleWalletApiResponse<WalletResponse>(response);
};

export const pollWalletStatus = async (
  credentialId: string,
  maxAttempts = 60,
  intervalMs = 2000,
): Promise<WalletResponse> => {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const walletStatus = await getWalletStatus(credentialId);

    if (walletStatus.status === "SUCCESS") {
      return walletStatus;
    }

    if (walletStatus.status === "FAILED") {
      throw new Error("Wallet creation failed");
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error("Wallet creation timeout");
};

export const getEmbeddedWalletProfile = async (
  token: string,
): Promise<EmbeddedWalletProfileResponse> => {
  const response = await fetch(`${API_URL}/embedded-wallets/profile`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "SDP-Tenant-Name": getSdpTenantName(),
    },
  });

  return handleWalletApiResponse<EmbeddedWalletProfileResponse>(response);
};
