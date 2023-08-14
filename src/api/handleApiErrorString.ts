import { GENERIC_ERROR_MESSAGE } from "constants/settings";
import { ApiError } from "types";

export const handleApiErrorString = (error: ApiError): string => {
  // Make sure error is not an empty object
  if (JSON.stringify(error) === "{}") {
    return GENERIC_ERROR_MESSAGE;
  }

  return (error?.extras?.message ||
    error.error ||
    error ||
    GENERIC_ERROR_MESSAGE) as string;
};
