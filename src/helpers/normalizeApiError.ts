import { GENERIC_ERROR_MESSAGE } from "@/constants/settings";
import { ApiError, AppError } from "@/types";

export const normalizeApiError = (
  error: ApiError,
  defaultMessage = GENERIC_ERROR_MESSAGE,
): AppError => {
  // This shouldn't happen, but adding just in case
  if (typeof error === "string") {
    return {
      message: (error as string).trim() || defaultMessage,
      extras: undefined,
    };
  }

  let message = "";
  const extras = error?.extras || {};

  if (isEmptyObject(error)) {
    message = defaultMessage;
  } else {
    // Check possible message props
    const possibleMessages = [error?.extras?.details, error?.extras?.message, error?.error];
    message = possibleMessages.find((p) => typeof p === "string" && p.trim()) || defaultMessage;
  }

  // Remove details and message from extras to avoid duplicate messages
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { details, message: extrasMessage, ...cleanExtras } = extras;

  return {
    message,
    extras: isEmptyObject(cleanExtras) ? undefined : cleanExtras,
  };
};

// Checking only if it's an object with keys, everything else is invalid.
const isEmptyObject = (obj: any) => !obj || JSON.stringify(obj) === "{}";
