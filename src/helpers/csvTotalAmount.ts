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
    const amount = new BigNumber(row[column].trim());
    if (!amount.isFinite()) {
      throw new Error(`Line ${index + 2} has an invalid amount: "${row[column]}"`);
    }
    totalAmount = totalAmount.plus(amount);
  });

  return { totalAmount, rowCount: rows.length };
};
