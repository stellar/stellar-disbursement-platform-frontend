import { StellarToml } from "@stellar/stellar-sdk";

import { API_URL } from "@/constants/envVariables";

export const getRequiredTomlInfo = async (
  requiredFields: readonly string[],
): Promise<Record<string, string>> => {
  const apiUrl = new URL(API_URL);
  const homeDomain = apiUrl.host;
  const allowHttp = apiUrl.protocol === "http:";
  const tomlResponse = await StellarToml.Resolver.resolve(homeDomain, { allowHttp });

  const missingFields = requiredFields.filter((field) => !tomlResponse[field]);

  if (missingFields.length) {
    throw new Error(`TOML missing required field(s) ${missingFields.join(", ")}`);
  }

  return requiredFields.reduce<Record<string, string>>((acc, field) => {
    const value = tomlResponse[field];
    acc[field] = typeof value === "string" ? value.replace(/\/$/, "") : String(value);
    return acc;
  }, {});
};
