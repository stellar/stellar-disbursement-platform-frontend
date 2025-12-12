import TOML from "toml";

import { API_URL } from "@/constants/envVariables";
import { getSdpTenantName } from "@/helpers/getSdpTenantName";

export const getRequiredTomlInfo = async (
  requiredFields: readonly string[],
): Promise<Record<string, string>> => {
  const response = await fetch(`${API_URL}/.well-known/stellar.toml`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "SDP-Tenant-Name": getSdpTenantName(),
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch stellar.toml: ${response.status} ${response.statusText}`);
  }

  let tomlResponse: Record<string, unknown>;
  try {
    const tomlText = await response.text();
    tomlResponse = TOML.parse(tomlText);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`stellar.toml is invalid and could not be parsed: ${detail}`);
  }

  const missingFields: string[] = [];
  const collectedFields: Record<string, string> = {};

  for (const field of requiredFields) {
    const value = tomlResponse[field];

    if (!value) {
      missingFields.push(field);
      continue;
    }

    collectedFields[field] = typeof value === "string" ? value.replace(/\/$/, "") : String(value);
  }

  if (missingFields.length) {
    throw new Error(`stellar.toml missing required field(s): ${missingFields.join(", ")}`);
  }

  return collectedFields;
};
