import { normalizeStellarApiError } from "helpers/normalizeStellarApiError";

type FetchStellarApiOptions = {
  notFoundMessage?: string;
};

export const fetchStellarApi = async (
  fetchUrl: string,
  fetchOptions?: RequestInit,
  options?: FetchStellarApiOptions,
) => {
  try {
    const request = await fetch(fetchUrl, fetchOptions);

    if (request.status === 404) {
      throw new Error(options?.notFoundMessage || "Not found");
    }

    const response = await request.json();

    return response;
  } catch (e) {
    throw normalizeStellarApiError(e as Error);
  }
};
