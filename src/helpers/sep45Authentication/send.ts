type Sep45SendParams = {
  authEndpoint: string;
  signedEntries: string;
};
export const send = async ({ authEndpoint, signedEntries }: Sep45SendParams) => {
  const params = new URLSearchParams({
    authorization_entries: signedEntries,
  });

  const response = await fetch(authEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });
  if (!response.ok) {
    throw new Error(`${response.status} Error getting SEP-45 token`);
  }

  const respJson = await response.json();

  if (!respJson.token) {
    throw new Error("No token returned from `/auth`");
  }

  return respJson.token;
};
