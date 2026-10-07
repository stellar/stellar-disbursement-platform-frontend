import { Buffer } from "buffer";

import { p256 } from "@noble/curves/p256";
import { startAuthentication } from "@simplewebauthn/browser";

import { hash, xdr } from "@stellar/stellar-sdk";

import { isAddressCredentialForContract } from "@/helpers/isAddressCredentialForContract";

type SignSorobanAuthorizationParams = {
  authEntries: xdr.SorobanAuthorizationEntry[];
  contractAddress: string;
  credentialId?: string;
  networkPassphrase: string;
  rpId: string;
  signatureExpirationLedger: number;
};

const encodeBase64Url = (input: Buffer | Uint8Array): string => {
  const buffer = Buffer.from(input);
  return buffer.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
};

const decodeBase64Url = (value: string): Buffer => {
  const padding = value.length % 4 === 0 ? "" : "=".repeat(4 - (value.length % 4));
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/") + padding;
  return Buffer.from(base64, "base64");
};

export const signSorobanAuthorizationEntries = async ({
  authEntries,
  contractAddress,
  credentialId,
  networkPassphrase,
  rpId,
  signatureExpirationLedger,
}: SignSorobanAuthorizationParams): Promise<xdr.SorobanAuthorizationEntry[]> => {
  const networkId = hash(Buffer.from(networkPassphrase, "utf8"));

  const signedEntries: xdr.SorobanAuthorizationEntry[] = [];

  for (const entry of authEntries) {
    const cloned = xdr.SorobanAuthorizationEntry.fromXDR(entry.toXDR());

    if (!isAddressCredentialForContract(cloned, contractAddress)) {
      signedEntries.push(cloned);
      continue;
    }

    const credentials = cloned.credentials().address();
    const preimage = xdr.HashIdPreimage.envelopeTypeSorobanAuthorization(
      new xdr.HashIdPreimageSorobanAuthorization({
        networkId,
        nonce: credentials.nonce(),
        signatureExpirationLedger,
        invocation: cloned.rootInvocation(),
      }),
    );

    const payload = hash(preimage.toXDR());
    const challenge = encodeBase64Url(payload);

    const allowCredentials = credentialId
      ? [{ id: credentialId, type: "public-key" as const }]
      : undefined;

    const authentication = await startAuthentication({
      optionsJSON: {
        challenge,
        rpId,
        allowCredentials,
        userVerification: "required",
      },
    });

    const clientDataJSON = decodeBase64Url(authentication.response.clientDataJSON);
    const authenticatorData = decodeBase64Url(authentication.response.authenticatorData);
    const signatureDer = decodeBase64Url(authentication.response.signature);
    const signature = Buffer.from(
      p256.Signature.fromDER(signatureDer).normalizeS().toCompactRawBytes(),
    );

    const webAuthnCredential = xdr.ScVal.scvMap([
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvSymbol("authenticator_data"),
        val: xdr.ScVal.scvBytes(authenticatorData),
      }),
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvSymbol("client_data_json"),
        val: xdr.ScVal.scvBytes(clientDataJSON),
      }),
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvSymbol("signature"),
        val: xdr.ScVal.scvBytes(signature),
      }),
    ]);

    credentials.signature(webAuthnCredential);
    credentials.signatureExpirationLedger(signatureExpirationLedger);

    signedEntries.push(cloned);
  }

  return signedEntries;
};
