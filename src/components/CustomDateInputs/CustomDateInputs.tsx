import { useEffect, useState } from "react";

import { Input, Text } from "@stellar/design-system";

import {
  formatDateForDisplay,
  formatYearMonthForDisplay,
  validateDateOfBirth,
  validateYearMonth,
} from "@/helpers/validateVerificationFields";

import "./styles.scss";

interface BaseCustomInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  error?: string;
  disabled?: boolean;
}

const BaseCustomInput: React.FC<{
  props: BaseCustomInputProps;
  formatValue: (value: string) => string;
  validateAndFormat: (value: string) => {
    isValid: boolean;
    formattedValue: string;
    errorMessage?: string;
  };
  minLength: number;
  infoText: string;
  className: string;
}> = ({ props, formatValue, validateAndFormat, minLength, infoText, className }) => {
  const { value, onChange, placeholder, error, disabled } = props;
  const [displayValue, setDisplayValue] = useState(value);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string>("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDisplayValue(inputValue);

    if (inputValue.length < minLength) {
      onChange(inputValue);
      setValidationError("");
      return;
    }

    setIsValidating(true);
    setValidationError("");
  };

  useEffect(() => {
    setDisplayValue(value);
    if (value) {
      const { isValid, errorMessage } = validateAndFormat(value);
      setValidationError(isValid ? "" : errorMessage || "Invalid format");
    } else {
      setValidationError("");
    }
  }, [value, validateAndFormat]);

  useEffect(() => {
    if (displayValue.length < minLength) {
      setIsValidating(false);
      setValidationError("");
      return;
    }

    const timeoutId = setTimeout(() => {
      const trimmedValue = displayValue.trim();
      const { isValid, formattedValue, errorMessage } = validateAndFormat(trimmedValue);

      if (isValid) {
        onChange(formattedValue);
        setDisplayValue(formattedValue);
        setValidationError("");
      } else {
        onChange(displayValue);
        setValidationError(errorMessage || "Invalid format");
      }
      setIsValidating(false);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [displayValue, minLength, validateAndFormat, onChange]);

  return (
    <div className={className}>
      <Input
        id={`${className.toLowerCase()}-input`}
        fieldSize="sm"
        type="text"
        placeholder={placeholder}
        value={displayValue}
        onChange={handleInputChange}
        error={error || validationError}
        disabled={disabled}
        infoText={isValidating ? "Validating..." : infoText}
      />
      {value && !isValidating && !error && !validationError && (
        <Text size="xs" as="p" className={`${className}__formatted`}>
          {formatValue(value)}
        </Text>
      )}
    </div>
  );
};

const validateAndFormatDate = (value: string) => {
  const result = validateDateOfBirth(value);
  return {
    isValid: result.isValid,
    formattedValue: result.formattedValue,
    errorMessage: result.errorMessage,
  };
};

const validateAndFormatYearMonth = (value: string) => {
  const result = validateYearMonth(value);
  return {
    isValid: result.isValid,
    formattedValue: result.formattedValue,
    errorMessage: result.errorMessage,
  };
};

export const CustomDateInput: React.FC<BaseCustomInputProps> = (props) => (
  <BaseCustomInput
    props={props}
    formatValue={formatDateForDisplay}
    validateAndFormat={validateAndFormatDate}
    minLength={8}
    infoText="Enter date in YYYY-MM-DD or YYYY MM DD format"
    className="CustomDateInput"
  />
);

export const CustomYearMonthInput: React.FC<BaseCustomInputProps> = (props) => (
  <BaseCustomInput
    props={props}
    formatValue={formatYearMonthForDisplay}
    validateAndFormat={validateAndFormatYearMonth}
    minLength={6}
    infoText="Enter year-month in YYYY-MM or YYYY MM format"
    className="CustomYearMonthInput"
  />
);
