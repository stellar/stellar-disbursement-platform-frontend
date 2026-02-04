import {
  startAuthentication,
  type AuthenticationResponseJSON,
  type PublicKeyCredentialRequestOptionsJSON,
} from "@simplewebauthn/browser";

import { API_URL } from "@/constants/envVariables";

import { handleApiResponse } from "@/api/handleApiResponse";

import { getSdpTenantName } from "@/helpers/getSdpTenantName";

export interface PasskeyAuthenticationStartResponse {
  publicKey: PublicKeyCredentialRequestOptionsJSON;
}

export interface PasskeyAuthenticationFinishResponse {
  token: string;
  credential_id: string;
  contract_address: string;
}

export const startPasskeyAuthentication = async (): Promise<PasskeyAuthenticationStartResponse> => {
  const response = await fetch(`${API_URL}/embedded-wallets/passkey/authentication/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "SDP-Tenant-Name": getSdpTenantName(),
    },
  });

  return handleApiResponse(response);
};

export const finishPasskeyAuthentication = async (
  credentialResponse: AuthenticationResponseJSON,
): Promise<PasskeyAuthenticationFinishResponse> => {
  const response = await fetch(`${API_URL}/embedded-wallets/passkey/authentication/finish`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "SDP-Tenant-Name": getSdpTenantName(),
    },
    body: JSON.stringify(credentialResponse),
  });

  return handleApiResponse(response);
};

export const authenticatePasskey = async (): Promise<PasskeyAuthenticationFinishResponse> => {
  // Step 1: Start authentication to get challenge and options
  const { publicKey } = await startPasskeyAuthentication();

  // Step 2: Use SimpleWebAuthn to authenticate with the passkey
  const credential = await startAuthentication({ optionsJSON: publicKey });

  // Step 3: Finish authentication by sending the credential to the server
  return await finishPasskeyAuthentication(credential);
};
