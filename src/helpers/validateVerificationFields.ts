import { DisbursementVerificationField } from "../types";

export interface ValidationResult {
  isValid: boolean;
  formattedValue: string;
  errorMessage?: string;
}

export const validateVerificationField = (
  type: DisbursementVerificationField,
  value: string,
): ValidationResult => {
  const trimmedValue = value.trim();

  switch (type) {
    case "DATE_OF_BIRTH": {
      return validateDateOfBirth(trimmedValue);
    }
    case "YEAR_MONTH": {
      return validateYearMonth(trimmedValue);
    }
    case "PIN": {
      return validatePin(trimmedValue);
    }
    case "NATIONAL_ID_NUMBER": {
      return validateNationalId(trimmedValue);
    }
    default: {
      return {
        isValid: true,
        formattedValue: trimmedValue,
      };
    }
  }
};

export const validateDateOfBirth = (value: string): ValidationResult => {
  // Handle both formats: YYYY-MM-DD and YYYY MM DD
  let formattedValue = value;
  if (/^\d{4}\s\d{1,2}\s\d{1,2}$/.test(value)) {
    const [year, month, day] = value.split(/\s+/);
    formattedValue = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(formattedValue)) {
    return {
      isValid: false,
      formattedValue,
      errorMessage: "Date of birth must be in YYYY-MM-DD or YYYY MM DD format",
    };
  }

  // Additional validation for reasonable date range
  const date = new Date(formattedValue);
  const now = new Date();
  const minDate = new Date(now.getFullYear() - 120, now.getMonth(), now.getDate());
  const maxDate = new Date(now.getFullYear() - 13, now.getMonth(), now.getDate());

  if (date < minDate || date > maxDate) {
    return {
      isValid: false,
      formattedValue,
      errorMessage: "Date of birth must be between 1900 and 2010",
    };
  }

  return {
    isValid: true,
    formattedValue,
  };
};

export const validateYearMonth = (value: string): ValidationResult => {
  // Handle both formats: YYYY-MM and YYYY MM
  let formattedValue = value;
  if (/^\d{4}\s\d{1,2}$/.test(value)) {
    const [year, month] = value.split(/\s+/);
    formattedValue = `${year}-${month.padStart(2, "0")}`;
  }

  if (!/^\d{4}-\d{2}$/.test(formattedValue)) {
    return {
      isValid: false,
      formattedValue,
      errorMessage: "Year-month must be in YYYY-MM or YYYY MM format",
    };
  }

  // Validate month is between 01-12
  const [, monthStr] = formattedValue.split("-");
  const monthNum = parseInt(monthStr, 10);
  if (monthNum < 1 || monthNum > 12) {
    return {
      isValid: false,
      formattedValue,
      errorMessage: "Month must be between 01 and 12",
    };
  }

  return {
    isValid: true,
    formattedValue,
  };
};

export const validatePin = (value: string): ValidationResult => {
  if (value.length < 4 || value.length > 8) {
    return {
      isValid: false,
      formattedValue: value,
      errorMessage: "PIN must be between 4 and 8 characters",
    };
  }

  if (!/^\d+$/.test(value)) {
    return {
      isValid: false,
      formattedValue: value,
      errorMessage: "PIN must contain only digits",
    };
  }

  return {
    isValid: true,
    formattedValue: value,
  };
};

export const validateNationalId = (value: string): ValidationResult => {
  if (value.length > 50) {
    return {
      isValid: false,
      formattedValue: value,
      errorMessage: "National ID must be at most 50 characters",
    };
  }

  return {
    isValid: true,
    formattedValue: value,
  };
};

// Formatting helpers for display purposes
export const formatDateForDisplay = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString;
    }
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
};

export const formatYearMonthForDisplay = (yearMonthString: string): string => {
  try {
    const [year, month] = yearMonthString.split("-");
    const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  } catch {
    return yearMonthString;
  }
};
