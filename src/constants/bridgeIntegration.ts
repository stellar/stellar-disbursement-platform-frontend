// Bridge Integration Constants

// Form field labels
export const BRIDGE_FIELD_LABELS = {
  FULL_NAME: "Full Name",
  EMAIL: "Email Address",
  KYC_TYPE: "KYC Type",
  INDIVIDUAL: "Individual",
  BUSINESS: "Business",
} as const;

// Form field descriptions
export const BRIDGE_FIELD_DESCRIPTIONS = {
  FULL_NAME:
    "This name will appear as the beneficiary on the virtual bank account",
  EMAIL:
    "This email address will be used for Bridge notifications and communication",
  KYC_TYPE: "Select the type of KYC verification you'll complete with Bridge",
} as const;

// Bridge-specific error messages
const BRIDGE_ERROR_MESSAGES = {
  NETWORK_ERROR:
    "Unable to connect to Bridge services. Please check your internet connection and try again.",
  UNAUTHORIZED:
    "Your session has expired. Please log in again to continue with Bridge integration.",
  FORBIDDEN:
    "You don't have permission to access Bridge integration features. Please contact your administrator.",
  NOT_FOUND:
    "Bridge integration service is not available. Please contact support.",
  KYC_REJECTED:
    "Your KYC verification was rejected. Please contact Bridge support for assistance.",
  TOS_REJECTED:
    "Your Terms of Service acceptance was rejected. Please contact Bridge support for assistance.",
  KYC_LINK_EXPIRED:
    "Your KYC verification link has expired. Please refresh and try again.",
  TOS_LINK_EXPIRED:
    "Your Terms of Service link has expired. Please refresh and try again.",
  VIRTUAL_ACCOUNT_CREATION_FAILED:
    "Failed to create virtual deposit account. Please ensure KYC and Terms of Service are completed and try again.",
  BRIDGE_SERVICE_UNAVAILABLE:
    "Bridge service is temporarily unavailable. Please try again later.",
  RATE_LIMIT_EXCEEDED:
    "Too many requests. Please wait a moment before trying again.",
  INVALID_EMAIL: "Please enter a valid email address.",
  INVALID_FULL_NAME: "Please enter a valid full name.",
  UNKNOWN_ERROR:
    "An unexpected error occurred with Bridge integration. Please try again or contact support if the problem persists.",
} as const;

// Helper function to get user-friendly error message
export const getBridgeErrorMessage = (error: any): string => {
  if (!error) return BRIDGE_ERROR_MESSAGES.UNKNOWN_ERROR;

  const message = error.message || error.error || "";
  const status = error.status || 0;

  // Handle HTTP status codes
  switch (status) {
    case 401:
      return BRIDGE_ERROR_MESSAGES.UNAUTHORIZED;
    case 403:
      return BRIDGE_ERROR_MESSAGES.FORBIDDEN;
    case 404:
      return BRIDGE_ERROR_MESSAGES.NOT_FOUND;
    case 429:
      return BRIDGE_ERROR_MESSAGES.RATE_LIMIT_EXCEEDED;
    case 500:
    case 502:
    case 503:
    case 504:
      return BRIDGE_ERROR_MESSAGES.BRIDGE_SERVICE_UNAVAILABLE;
  }

  // Handle specific Bridge error messages
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("network") || lowerMessage.includes("connection")) {
    return BRIDGE_ERROR_MESSAGES.NETWORK_ERROR;
  }

  if (lowerMessage.includes("kyc")) {
    if (lowerMessage.includes("rejected")) {
      return BRIDGE_ERROR_MESSAGES.KYC_REJECTED;
    }
    if (lowerMessage.includes("expired")) {
      return BRIDGE_ERROR_MESSAGES.KYC_LINK_EXPIRED;
    }
  }

  if (lowerMessage.includes("tos") || lowerMessage.includes("terms")) {
    if (lowerMessage.includes("rejected")) {
      return BRIDGE_ERROR_MESSAGES.TOS_REJECTED;
    }
    if (lowerMessage.includes("expired")) {
      return BRIDGE_ERROR_MESSAGES.TOS_LINK_EXPIRED;
    }
  }

  if (
    lowerMessage.includes("virtual account") ||
    lowerMessage.includes("deposit account")
  ) {
    return BRIDGE_ERROR_MESSAGES.VIRTUAL_ACCOUNT_CREATION_FAILED;
  }

  if (lowerMessage.includes("email")) {
    return BRIDGE_ERROR_MESSAGES.INVALID_EMAIL;
  }

  if (lowerMessage.includes("name")) {
    return BRIDGE_ERROR_MESSAGES.INVALID_FULL_NAME;
  }

  // Return original message if it's user-friendly, otherwise use default
  if (message && message.length > 0 && message.length < 200) {
    return message;
  }

  return BRIDGE_ERROR_MESSAGES.UNKNOWN_ERROR;
};
