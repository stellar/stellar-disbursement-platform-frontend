import { GENERIC_ERROR_MESSAGE } from "constants/settings";
import { ApiError, AppError } from "types";

export const normalizeApiError = (
  error: ApiError,
  defaultMessage = GENERIC_ERROR_MESSAGE,
): AppError => {
  let message = "";
  const extras = error?.extras;

  // Make sure error is not an empty object
  if (JSON.stringify(error) === "{}") {
    message = defaultMessage;
  } else {
    message = (error?.extras?.details ||
      error?.extras?.message ||
      error.error ||
      error ||
      defaultMessage) as string;
  }

  // Remove details and message from extras to avoid duplicate messages
  if (extras?.details) {
    delete extras.details;
  }

  if (extras?.message) {
    delete extras.message;
  }

  return {
    message,
    extras,
  };
};
