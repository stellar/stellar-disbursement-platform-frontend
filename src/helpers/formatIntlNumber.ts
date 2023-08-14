import { LOCALE } from "constants/settings";

export const currency = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: "USD",
});

export const decimal = new Intl.NumberFormat(LOCALE, {
  style: "decimal",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const percent = new Intl.NumberFormat(LOCALE, {
  style: "percent",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const number = new Intl.NumberFormat(LOCALE);
