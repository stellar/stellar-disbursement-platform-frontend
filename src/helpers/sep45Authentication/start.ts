type Sep45StartParams = {
  authEndpoint: string;
  contractAddress: string;
  homeDomain: string;
};

type Sep45ChallengeResponse = {
  authorizationEntries: string;
  networkPassphrase: string;
};

export const start = async ({
  authEndpoint,
  contractAddress,
  homeDomain,
}: Sep45StartParams): Promise<Sep45ChallengeResponse> => {
  const params = new URLSearchParams({
    account: contractAddress,
    home_domain: homeDomain,
  });

  const authURL = new URL(authEndpoint);
  params.forEach((value, key) => authURL.searchParams.append(key, value));

  const response = await fetch(authURL.toString());
  if (!response.ok) {
    throw new Error(`${response.status} Error getting SEP-45 challenge`);
  }

  const responseJson = await response.json();
  const { authorization_entries, network_passphrase } = responseJson;
  if (!authorization_entries || !network_passphrase) {
    throw new Error("Invalid response from SEP-45 server");
  }

  return {
    authorizationEntries: authorization_entries,
    networkPassphrase: network_passphrase,
  };
};
