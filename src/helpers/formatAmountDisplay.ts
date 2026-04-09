import { amount as amountFormatter } from "@/helpers/formatIntlNumber";

const AMOUNT_GROUP_SEPARATOR =
  amountFormatter.formatToParts(1000).find((part) => part.type === "group")?.value ?? ",";
const AMOUNT_DECIMAL_SEPARATOR =
  amountFormatter.formatToParts(1.1).find((part) => part.type === "decimal")?.value ?? ".";

// Format a numeric string with grouping separators while preserving decimals.
export const formatAmountDisplay = (rawAmount: string) => {
  const normalized = rawAmount.replace(/,/g, "");
  if (!normalized) {
    return "";
  }

  if (!/^\d*\.?\d*$/.test(normalized)) {
    return rawAmount;
  }

  const hasDecimal = normalized.includes(".");
  const [integerPart, decimalPart = ""] = normalized.split(".");
  const groupedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, AMOUNT_GROUP_SEPARATOR);

  if (!hasDecimal) {
    return groupedInteger;
  }

  return `${groupedInteger}${AMOUNT_DECIMAL_SEPARATOR}${decimalPart}`;
};
