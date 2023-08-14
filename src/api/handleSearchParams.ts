import { createUrlSearchParamsString } from "helpers/createUrlSearchParamsString";
import { sanitizeObject } from "helpers/sanitizeObject";

export const handleSearchParams = <T>(searchParams: T) => {
  let params = "";

  if (searchParams) {
    // Remove params with empty strings
    const sanitizedParams = sanitizeObject(searchParams);

    if (Object.keys(sanitizedParams).length > 0) {
      params = createUrlSearchParamsString(sanitizedParams);
    }
  }

  return params;
};
