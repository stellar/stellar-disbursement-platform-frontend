import BigNumber from "bignumber.js";

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
    const reader = new FileReader();
    reader.readAsText(csvFile);

    reader.onload = () => {
      try {
        const csvRows = reader.result?.toString();
        if (!csvRows) return;

        const [header, ...rows] = csvRows.split("\n");
        const amountIndex = header.split(",").indexOf(columnName);
        if (amountIndex === -1) return;

        const totalAmount = rows.reduce((accumulator, line) => {
          return !line
            ? accumulator
            : accumulator.plus(BigNumber(line.split(",")[amountIndex]));
        }, BigNumber(0));

        resolve(totalAmount);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => {
      reject(error);
    };
  });
};
