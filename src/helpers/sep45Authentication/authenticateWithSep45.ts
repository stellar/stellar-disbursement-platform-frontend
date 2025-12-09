import { getRequiredTomlInfo } from "../getRequiredTomlInfo";

import { send } from "./send";
import { sign } from "./sign";
import { start } from "./start";

import { API_URL } from "@/constants/envVariables";

const SEP45_REQUIRED_TOML_FIELDS = [
  "SIGNING_KEY",
  "WEB_AUTH_CONTRACT_ID",
  "WEB_AUTH_FOR_CONTRACTS_ENDPOINT",
] as const;

export const authenticateWithSep45 = async (
  contractAddress: string,
  credentialId: string,
): Promise<string> => {
  const tomlValues = await getRequiredTomlInfo(SEP45_REQUIRED_TOML_FIELDS);
  const homeDomain = new URL(API_URL).host;

  const challenge = await start({
    authEndpoint: tomlValues.WEB_AUTH_FOR_CONTRACTS_ENDPOINT,
    contractAddress,
    homeDomain,
  });

  const signedEntries = await sign({
    authEntries: challenge.authorizationEntries,
    contractAddress,
    credentialId,
    serverSigningKey: tomlValues.SIGNING_KEY,
    webAuthContractId: tomlValues.WEB_AUTH_CONTRACT_ID,
  });

  return await send({
    authEndpoint: tomlValues.WEB_AUTH_FOR_CONTRACTS_ENDPOINT,
    signedEntries,
  });
};
