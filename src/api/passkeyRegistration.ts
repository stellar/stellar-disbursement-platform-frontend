import {
  startRegistration,
  type PublicKeyCredentialCreationOptionsJSON,
  type RegistrationResponseJSON,
} from "@simplewebauthn/browser";

import { handleApiResponse } from "@/api/handleApiResponse";
import { API_URL } from "@/constants/envVariables";
import { getSdpTenantName } from "@/helpers/getSdpTenantName";

export interface PasskeyRegistrationStartRequest {
  token: string;
}

export interface PasskeyRegistrationStartResponse {
  publicKey: PublicKeyCredentialCreationOptionsJSON;
}

export interface PasskeyRegistrationFinishResponse {
  credential_id: string;
  public_key: string;
}

export const startPasskeyRegistration = async (
  token: string,
): Promise<PasskeyRegistrationStartResponse> => {
  const response = await fetch(`${API_URL}/embedded-wallets/passkey/registration/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "SDP-Tenant-Name": getSdpTenantName(),
    },
    body: JSON.stringify({ token }),
  });

  return handleApiResponse(response);
};

export const finishPasskeyRegistration = async (
  token: string,
  credentialResponse: RegistrationResponseJSON,
): Promise<PasskeyRegistrationFinishResponse> => {
  const response = await fetch(
    `${API_URL}/embedded-wallets/passkey/registration/finish?token=${encodeURIComponent(token)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "SDP-Tenant-Name": getSdpTenantName(),
      },
      body: JSON.stringify(credentialResponse),
    },
  );

  return handleApiResponse(response);
};

export const registerPasskey = async (
  token: string,
): Promise<PasskeyRegistrationFinishResponse> => {
  // Step 1: Start registration to get challenge and options
  const { publicKey } = await startPasskeyRegistration(token);

  // Step 2: Use SimpleWebAuthn to create the passkey
  const credential = await startRegistration({ optionsJSON: publicKey });

  // Step 3: Finish registration by sending the credential to the server
  return await finishPasskeyRegistration(token, credential);
};
