import { handleApiResponse } from "@/api/handleApiResponse";
import { handleSearchParams } from "@/api/handleSearchParams";

type Sep45SendParams = {
  authEndpoint: string;
  signedEntries: string;
};
export const send = async ({ authEndpoint, signedEntries }: Sep45SendParams) => {
  const params = handleSearchParams({
    authorization_entries: signedEntries,
  });

  const response = await fetch(`${authEndpoint}${params}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  const respJson = await handleApiResponse(response);

  if (!respJson.token) {
    throw new Error("No token returned from `/auth`");
  }

  return respJson.token;
};
