import { useEffect, useRef, useState } from "react";

import { Input, Text } from "@stellar/design-system";

import "./styles.scss";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

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
  validateAndFormat: (value: string) => { isValid: boolean; formattedValue: string };
  minLength: number;
  infoText: string;
  className: string;
}> = ({ props, formatValue, validateAndFormat, minLength, infoText, className }) => {
  const { value, onChange, placeholder, error, disabled } = props;
  const [displayValue, setDisplayValue] = useState(value);
  const [isValidating, setIsValidating] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDisplayValue(inputValue);

    if (inputValue.length < minLength) {
      onChange(inputValue);
      return;
    }

    setIsValidating(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      const trimmedValue = inputValue.trim();
      const { isValid, formattedValue } = validateAndFormat(trimmedValue);

      if (isValid) {
        onChange(formattedValue);
        setDisplayValue(formattedValue);
      } else {
        onChange(inputValue);
      }
      setIsValidating(false);
    }, 500);
  };

  const handleBlur = () => {
    const trimmedValue = displayValue.trim();
    const { isValid, formattedValue } = validateAndFormat(trimmedValue);

    if (isValid) {
      setDisplayValue(formatValue(formattedValue));
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={className}>
      <Input
        id={`${className.toLowerCase()}-input`}
        fieldSize="sm"
        type="text"
        placeholder={placeholder}
        value={displayValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        error={error}
        disabled={disabled}
        infoText={isValidating ? "Validating..." : infoText}
      />
      {value && !isValidating && (
        <Text size="xs" as="p" className={`${className}__formatted`}>
          {formatValue(value)}
        </Text>
      )}
    </div>
  );
};

const validateAndFormatDate = (value: string) => {
  let formattedValue = value;
  if (/^\d{4}\s\d{1,2}\s\d{1,2}$/.test(value)) {
    const [year, month, day] = value.split(/\s+/);
    formattedValue = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  const isValid =
    /^\d{4}-\d{2}-\d{2}$/.test(formattedValue) && !isNaN(new Date(formattedValue).getTime());
  return { isValid, formattedValue };
};

const formatDateForDisplay = (dateString: string): string => {
  if (!dateString || dateString.length < 10) return dateString;

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const month = MONTHS[date.getMonth()];
    const day = date.getDate().toString().padStart(2, "0");
    const year = date.getFullYear();

    return `${month} ${day}, ${year}`;
  } catch {
    return dateString;
  }
};

const validateAndFormatYearMonth = (value: string) => {
  let formattedValue = value;
  if (/^\d{4}\s\d{1,2}$/.test(value)) {
    const [year, month] = value.split(/\s+/);
    formattedValue = `${year}-${month.padStart(2, "0")}`;
  }

  if (!/^\d{4}-\d{2}$/.test(formattedValue)) {
    return { isValid: false, formattedValue };
  }

  const [, monthStr] = formattedValue.split("-");
  const monthNum = parseInt(monthStr, 10);
  const isValid = monthNum >= 1 && monthNum <= 12;

  return { isValid, formattedValue };
};

const formatYearMonthForDisplay = (yearMonthString: string): string => {
  if (!yearMonthString || yearMonthString.length < 7) return yearMonthString;

  try {
    const [year, month] = yearMonthString.split("-");
    const monthNum = parseInt(month, 10);

    if (monthNum < 1 || monthNum > 12) return yearMonthString;

    const monthName = MONTHS[monthNum - 1];
    return `${monthName} ${year}`;
  } catch {
    return yearMonthString;
  }
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
