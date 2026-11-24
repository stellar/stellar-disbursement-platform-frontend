import BigNumber from "bignumber.js";

import { readDisbursementCsv } from "@/helpers/readDisbursementCsv";

type CSVTotalAmountProps = {
  csvFile?: File;
  columnName?: string;
};

export type CsvSummary = {
  totalAmount: BigNumber;
  // Number of data rows (payments) in the file, excluding the header.
  rowCount: number;
};

const AMOUNT_FORMAT = /^-?[.0-9]{1,20}$/;
const MAX_AMOUNT = new BigNumber("922337203685.4775807");
const trimSpace = (value: string) => value.replace(/^\p{White_Space}+|\p{White_Space}+$/gu, "");

export const csvTotalAmount = async ({
  csvFile,
  columnName = "amount",
}: CSVTotalAmountProps): Promise<CsvSummary | null> => {
  if (!csvFile) return null;

  const { rows, columns } = await readDisbursementCsv(csvFile);
  if (rows.length === 0) {
    return { totalAmount: new BigNumber(0), rowCount: 0 };
  }

  const column = columns[columnName];
  if (column === undefined) {
    throw new Error(`Column "${columnName}" not found in CSV`);
  }

  let totalAmount = new BigNumber(0);
  rows.forEach((row, index) => {
    const value = trimSpace(row[column]);
    const amount = new BigNumber(value);
    if (
      !AMOUNT_FORMAT.test(value) ||
      !amount.isFinite() ||
      amount.lte(0) ||
      (amount.decimalPlaces() ?? 0) > 7 ||
      amount.gt(MAX_AMOUNT)
    ) {
      throw new Error(`Line ${index + 2} has an invalid amount: "${row[column]}"`);
    }
    totalAmount = totalAmount.plus(amount);
  });

  return { totalAmount, rowCount: rows.length };
};
