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
  const normalizedValue = value
    .trim()
    .replace(/[/.\s]+/g, "-")
    .replace(
      /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
      (_, year, month, day) => `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`,
    );

  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalizedValue)) {
    return {
      isValid: false,
      formattedValue: normalizedValue,
      errorMessage: "Date must be in YYYY-MM-DD format (e.g., 1990-01-15)",
    };
  }

  const [year, month, day] = normalizedValue.split("-").map(Number);

  if (month < 1 || month > 12) {
    return {
      isValid: false,
      formattedValue: normalizedValue,
      errorMessage: "Month must be between 01 and 12",
    };
  }

  const date = new Date(year, month - 1, day);
  const isValidDate =
    date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;

  if (!isValidDate) {
    return {
      isValid: false,
      formattedValue: normalizedValue,
      errorMessage: `Invalid date: ${year}-${month.toString().padStart(2, "0")} has no day ${day}`,
    };
  }

  const minDate = new Date(1900, 0, 1);
  const today = new Date();
  const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());

  if (date < minDate) {
    return {
      isValid: false,
      formattedValue: normalizedValue,
      errorMessage: "Date cannot be before 1900",
    };
  }

  if (date > maxDate) {
    return {
      isValid: false,
      formattedValue: normalizedValue,
      errorMessage: "You must be at least 18 years old",
    };
  }

  return {
    isValid: true,
    formattedValue: normalizedValue,
  };
};

export const validateYearMonth = (value: string): ValidationResult => {
  const normalizedValue = value
    .trim()
    .replace(/[/.\s]+/g, "-")
    .replace(/^(\d{4})-(\d{1,2})$/, (_, year, month) => `${year}-${month.padStart(2, "0")}`);

  if (!/^\d{4}-\d{2}$/.test(normalizedValue)) {
    return {
      isValid: false,
      formattedValue: normalizedValue,
      errorMessage: "Format must be YYYY-MM (e.g., 2024-01)",
    };
  }

  const [year, month] = normalizedValue.split("-").map(Number);
  const currentYear = new Date().getFullYear();
  const minDate = new Date(1900, 0, 1);
  const maxDate = new Date(currentYear - 18, 0, 1);

  if (month < 1 || month > 12) {
    return {
      isValid: false,
      formattedValue: normalizedValue,
      errorMessage: "Month must be between 01 and 12",
    };
  }

  if (year < minDate.getFullYear()) {
    return {
      isValid: false,
      formattedValue: normalizedValue,
      errorMessage: "Year cannot be before 1900",
    };
  }

  if (year > maxDate.getFullYear()) {
    return {
      isValid: false,
      formattedValue: normalizedValue,
      errorMessage: "You must be at least 18 years old",
    };
  }

  return {
    isValid: true,
    formattedValue: normalizedValue,
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
