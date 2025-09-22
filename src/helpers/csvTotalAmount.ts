import BigNumber from "bignumber.js";
import Papa from "papaparse";

type CSVTotalAmountProps = {
  csvFile?: File;
  columnName?: string;
};

export const csvTotalAmount = ({
  csvFile,
  columnName = "amount",
}: CSVTotalAmountProps): Promise<BigNumber | null> => {
  if (!csvFile) return Promise.resolve(null);

  return new Promise((resolve, reject) => {
    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        try {
          if (result.errors.length > 0) {
            reject(new Error(`CSV parsing error: ${result.errors[0].message}`));
            return;
          }

          const data = result.data as Record<string, string>[];
          if (data.length === 0) {
            resolve(new BigNumber(0));
            return;
          }

          // Check if the column exists
          const headerRow = data[0];
          if (!(columnName in headerRow)) {
            reject(new Error(`Column "${columnName}" not found in CSV`));
            return;
          }

          let totalAmount = new BigNumber(0);

          for (const row of data) {
            const amountValue = row[columnName];
            if (!amountValue || amountValue.trim() === "") continue;

            try {
              const amount = new BigNumber(amountValue.trim());
              if (!amount.isNaN() && amount.isFinite()) {
                totalAmount = totalAmount.plus(amount);
              }
            } catch {
              // Skipping invalid amount.
            }
          }

          resolve(totalAmount);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(new Error(`Failed to parse CSV: ${error.message}`));
      },
    });
  });
};
