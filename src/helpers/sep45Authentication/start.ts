import { handleApiResponse } from "@/api/handleApiResponse";
import { handleSearchParams } from "@/api/handleSearchParams";

type Sep45StartParams = {
  authEndpoint: string;
  contractAddress: string;
  homeDomain: string;
};

export const start = async ({
  authEndpoint,
  contractAddress,
  homeDomain,
}: Sep45StartParams): Promise<string> => {
  const params = handleSearchParams({
    account: contractAddress,
    home_domain: homeDomain,
  });

  const response = await fetch(`${authEndpoint}${params}`, {
    method: "GET",
  });
  const responseJson = await handleApiResponse(response);

  const { authorization_entries, network_passphrase } = responseJson;
  if (!authorization_entries || !network_passphrase) {
    throw new Error("Invalid response from SEP-45 server");
  }

  return authorization_entries;
};
