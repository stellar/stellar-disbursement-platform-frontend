import { GENERIC_ERROR_MESSAGE } from "constants/settings";
import { ApiError, AppError } from "types";

export const normalizeApiError = (
  error: ApiError,
  defaultMessage = GENERIC_ERROR_MESSAGE,
): AppError => {
  let message = "";

  // Make sure error is not an empty object
  if (JSON.stringify(error) === "{}") {
    message = defaultMessage;
  } else {
    message = (error?.extras?.message ||
      error.error ||
      error ||
      defaultMessage) as string;
  }

  return {
    message: message,
    extras: error?.extras,
  };
};
