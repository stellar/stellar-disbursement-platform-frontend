import { ApiError } from "types";

export const parseApiError = (error: ApiError) => {
  const errorMessage = error.error;
  const errorExtras = error.extras
    ? Object.values(error.extras).join(", ")
    : "";

  if (errorExtras) {
    return `${errorMessage}: ${errorExtras}`;
  }

  return `${errorMessage}`;
};
