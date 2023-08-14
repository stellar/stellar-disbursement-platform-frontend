import { number as formatNumber } from "helpers/formatIntlNumber";

export const renderNumberOrDash = (number?: number) => {
  if (number !== undefined && number !== null) {
    return formatNumber.format(number);
  }

  return "-";
};
